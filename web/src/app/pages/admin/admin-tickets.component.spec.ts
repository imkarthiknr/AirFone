import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AdminTicketRespondComponent, AdminTicketsComponent } from './admin-tickets.component';

const ticket = {
  id: 4,
  ticket_no: 'TKT123456',
  description: 'No signal at home',
  assigned_to: 'Ravi',
  status: 'open',
  response: null,
  responded_at: null,
  created_at: '2026-10-01T10:00:00Z',
  customer_name: 'Asha',
  customer_email: 'asha@example.com',
  customer_mobile: '9000000001',
};

describe('Admin tickets', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [
            { path: 'admin/tickets', component: AdminTicketsComponent },
            { path: 'admin/tickets/:id', component: AdminTicketRespondComponent },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  it('passes the status filter from the URL', async () => {
    await harness.navigateByUrl('/admin/tickets?status=open', AdminTicketsComponent);
    const req = http.expectOne((r) => r.url === '/api/v1/admin/tickets');
    expect(req.request.params.get('status')).toBe('open');
    req.flush({ items: [ticket], total: 1, page: 1, size: 10, pages: 1 });
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.textContent).toContain('TKT123456');
  });

  it('sends a response and shows it as resolved', async () => {
    await harness.navigateByUrl('/admin/tickets/4', AdminTicketRespondComponent);
    http.expectOne('/api/v1/admin/tickets/4').flush(ticket);
    harness.detectChanges();
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement!;
    const button = () => el.querySelector<HTMLButtonElement>('button')!;
    expect(button().disabled).toBe(true);

    const textarea = el.querySelector<HTMLTextAreaElement>('#message')!;
    textarea.value = 'Fixed the tower.';
    textarea.dispatchEvent(new Event('input'));
    harness.detectChanges();
    await harness.fixture.whenStable();
    button().click();
    const req = http.expectOne('/api/v1/admin/tickets/4/respond');
    expect(req.request.body).toEqual({ message: 'Fixed the tower.' });
    req.flush({
      ...ticket,
      status: 'resolved',
      response: 'Fixed the tower.',
      responded_at: '2026-10-02T10:00:00Z',
    });
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(el.textContent).toContain('Response sent');
  });
});
