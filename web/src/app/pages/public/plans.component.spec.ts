import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PlansComponent } from './plans.component';

const mk = (id: number, category: string, price: number) => ({
  id,
  category,
  name: `P${id}`,
  price,
  validity_days: 28,
  data: '1GB/day',
  calls: 'Unlimited',
  sms: null,
  speed: category === 'broadband' ? '150 Mbps' : null,
  post_fup_speed: null,
  is_popular: false,
});

describe('PlansComponent', () => {
  it('groups all plans, and filters by the :category route param', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [
            { path: 'plans', component: PlansComponent },
            { path: 'plans/:category', component: PlansComponent },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/plans', PlansComponent);
    http
      .expectOne('/api/v1/plans')
      .flush([mk(1, 'prepaid', 99), mk(2, 'postpaid', 400), mk(3, 'broadband', 777)]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement!;
    expect(el.querySelectorAll('app-plan-card').length).toBe(3);
    expect([...el.querySelectorAll('h2')].map((h) => h.textContent)).toEqual([
      'Prepaid',
      'Postpaid',
      'Broadband',
    ]);

    await harness.navigateByUrl('/plans/broadband', PlansComponent);
    harness.detectChanges();
    await harness.fixture.whenStable();
    const el2 = harness.routeNativeElement!;
    expect(el2.querySelector('h1')?.textContent).toContain('Broadband plans');
    expect(el2.querySelectorAll('app-plan-card').length).toBe(1);
    expect(el2.textContent).toContain('150 Mbps');
    http.verify();
  });
});
