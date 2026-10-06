import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { RechargeComponent } from './recharge.component';

const plan = {
  id: 9,
  category: 'prepaid',
  name: 'Value 298',
  price: 298,
  validity_days: 28,
  data: '2GB/day',
  calls: 'Unlimited',
  sms: '100/day',
  speed: null,
  post_fup_speed: null,
  is_popular: true,
};
const summary = (type: string) => ({
  customer: { mobile_no: '9000000001', connection_type: type },
  active_bill: null,
  days_left: null,
  total_spent: 0,
  recharge_count: 0,
  open_tickets: 0,
});

describe('RechargeComponent', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  const el = () => harness.routeNativeElement!;
  const settle = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
  };
  const fill = (id: string, value: string) => {
    const input = el().querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input'));
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [
            { path: 'recharge/:planId', component: RechargeComponent },
            { path: 'recharge/success/:billId', children: [] },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/recharge/9', RechargeComponent);
  });

  afterEach(() => http.verify());

  const load = async (type = 'prepaid') => {
    http.expectOne('/api/v1/plans/9').flush(plan);
    http.expectOne('/api/v1/me').flush(summary(type));
    await settle();
  };

  const fillCard = async (number: string) => {
    fill('cardholder', 'Asha Verma');
    fill('number', number);
    fill('exp_month', '12');
    fill('exp_year', String(new Date().getFullYear() + 1));
    fill('cvv', '123');
    await settle();
  };

  it('shows the order summary and formats the card number', async () => {
    await load();
    expect(el().textContent).toContain('9000000001');
    expect(el().textContent).toContain('Value 298');
    await fillCard('4242424242424242');
    expect(el().querySelector<HTMLInputElement>('#number')!.value).toBe('4242 4242 4242 4242');
    expect(el().textContent).toContain('Visa');
  });

  it('disables payment when the plan does not match the connection type', async () => {
    await load('broadband');
    expect(el().textContent).toContain('Your connection is broadband');
    expect(el().querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
  });

  it('sends digits only and shows a decline', async () => {
    await load();
    await fillCard('4000 0000 0000 0002');
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    const req = http.expectOne('/api/v1/me/recharges');
    expect(req.request.body).toEqual({
      plan_id: 9,
      card: {
        cardholder_name: 'Asha Verma',
        number: '4000000000000002',
        exp_month: 12,
        exp_year: new Date().getFullYear() + 1,
        cvv: '123',
      },
    });
    req.flush(
      { detail: 'Payment declined by the bank. Try another card.' },
      { status: 402, statusText: 'Payment Required' },
    );
    await settle();
    expect(el().textContent).toContain('Payment declined');
  });

  it('navigates to the receipt on success', async () => {
    await load();
    await fillCard('4242 4242 4242 4242');
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    http.expectOne('/api/v1/me/recharges').flush({ id: 55 });
    await settle();
    expect(TestBed.inject(Router).url).toBe('/recharge/success/55');
  });
});
