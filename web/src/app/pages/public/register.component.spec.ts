import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let http: HttpTestingController;
  let el: HTMLElement;

  const fill = (values: Record<string, string>) => {
    for (const [id, value] of Object.entries(values)) {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
    }
  };
  const submit = async () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };
  const valid = {
    name: 'Asha Verma',
    dob: '1995-04-18',
    email: 'asha@example.com',
    occupation: 'Designer',
    aadhaar: '2345 6789 0124',
    password: 'airfone123',
    house_no: '12',
    street: 'MG Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600041',
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegisterComponent);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('blocks submission and explains invalid Aadhaar and age', async () => {
    fill({ ...valid, aadhaar: '2345 6789 0125', dob: new Date().toISOString().slice(0, 10) });
    await submit();
    http.expectNone('/api/v1/auth/register');
    expect(el.textContent).toContain("isn't a valid Aadhaar number");
    expect(el.textContent).toContain('at least 18 years old');
  });

  it('sends digits-only Aadhaar and shows the allocated number', async () => {
    fill(valid);
    await submit();
    const req = http.expectOne('/api/v1/auth/register');
    expect(req.request.body.aadhaar).toBe('234567890124');
    expect(req.request.body.connection_type).toBe('prepaid');
    req.flush({
      customer: {
        name: 'Asha Verma',
        mobile_no: '9876543210',
        email: 'asha@example.com',
        connection_type: 'prepaid',
      },
      message: '',
    });
    await fixture.whenStable();
    expect(el.querySelector('[data-testid=new-number]')?.textContent).toContain('9876543210');
  });

  it('shows server field errors', async () => {
    fill(valid);
    await submit();
    http
      .expectOne('/api/v1/auth/register')
      .flush(
        { detail: 'This e-mail is already registered.', fields: { email: 'Already registered.' } },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();
    expect(el.textContent).toContain('Already registered.');
    expect(el.querySelector('#email')!.getAttribute('aria-invalid')).toBe('true');
  });
});
