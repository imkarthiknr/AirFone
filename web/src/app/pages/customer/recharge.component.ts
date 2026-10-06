import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { errorMessage, fieldErrors } from '../../core/http-error';
import { AccountSummary, Plan } from '../../core/models';
import { AccountService } from '../../core/services/account.service';
import { PlansService } from '../../core/services/plans.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldErrorComponent, applyServerErrors } from '../../shared/field-error.component';
import { cardBrand, cardNumberValidator, digitsOnly, notExpired } from '../../shared/validators';

/**
 * Recharge: the original Bill (confirm number + amount) and Payment (card) pages in one flow.
 * Cards are validated client-side and by the API's mock gateway; nothing card-related is stored
 * except brand and last four digits.
 */
@Component({
  selector: 'app-recharge',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, FieldErrorComponent],
  template: `
    <div class="container page">
      <a routerLink="/plans" class="small">← Back to plans</a>
      <h1>Recharge</h1>
      @if (loadError(); as e) {
        <p class="alert error">{{ e }}</p>
      } @else if (plan(); as p) {
        <div class="layout">
          <section class="card summary" aria-labelledby="order">
            <h2 id="order">Order summary</h2>
            <dl>
              <div>
                <dt>Mobile number</dt>
                <dd class="mono">{{ account()?.customer?.mobile_no ?? '…' }}</dd>
              </div>
              <div>
                <dt>Plan</dt>
                <dd>
                  {{ p.name }} <span class="badge {{ p.category }}">{{ p.category }}</span>
                </dd>
              </div>
              <div>
                <dt>Benefits</dt>
                <dd>{{ benefits() }}</dd>
              </div>
              <div>
                <dt>Validity</dt>
                <dd>{{ p.validity_days }} days</dd>
              </div>
              <div class="total">
                <dt>Amount</dt>
                <dd>{{ p.price | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}</dd>
              </div>
            </dl>
            @if (mismatch()) {
              <p class="alert error" role="alert">
                Your connection is {{ account()!.customer.connection_type }}. Pick a
                <a [routerLink]="['/plans', account()!.customer.connection_type]"
                  >{{ account()!.customer.connection_type }} plan</a
                >.
              </p>
            }
          </section>

          <form class="card" [formGroup]="form" (ngSubmit)="pay()" novalidate>
            <h2>Payment</h2>
            <p class="alert info small">
              Demo gateway: use <b class="mono">4242 4242 4242 4242</b> to succeed or
              <b class="mono">4000 0000 0000 0002</b> to see a decline. Any future expiry, any CVV.
            </p>
            <div class="field">
              <label for="cardholder">Name on card</label>
              <input id="cardholder" formControlName="cardholder_name" autocomplete="cc-name" />
              <app-field-error [control]="form.controls.cardholder_name" />
            </div>
            <div class="field">
              <label for="number"
                >Card number
                @if (brand()) {
                  <span class="badge">{{ brand() }}</span>
                }
              </label>
              <input
                id="number"
                formControlName="number"
                inputmode="numeric"
                autocomplete="cc-number"
                placeholder="1234 5678 9012 3456"
                (input)="formatNumber()"
              />
              <app-field-error [control]="form.controls.number" />
            </div>
            <div class="grid-3">
              <div class="field">
                <label for="exp_month">Exp. month</label>
                <select id="exp_month" formControlName="exp_month" autocomplete="cc-exp-month">
                  <option value="">Month</option>
                  @for (m of months; track m.value) {
                    <option [value]="m.value">{{ m.label }}</option>
                  }
                </select>
                <app-field-error [control]="form.controls.exp_month" />
              </div>
              <div class="field">
                <label for="exp_year">Exp. year</label>
                <select id="exp_year" formControlName="exp_year" autocomplete="cc-exp-year">
                  <option value="">Year</option>
                  @for (y of years; track y) {
                    <option [value]="y">{{ y }}</option>
                  }
                </select>
                <app-field-error [control]="form.controls.exp_year" />
              </div>
              <div class="field">
                <label for="cvv">CVV</label>
                <input
                  id="cvv"
                  formControlName="cvv"
                  inputmode="numeric"
                  autocomplete="cc-csc"
                  type="password"
                  maxlength="4"
                />
                <app-field-error [control]="form.controls.cvv" patternMessage="3 or 4 digits." />
              </div>
            </div>
            @if (form.hasError('expired') && form.controls.exp_year.touched) {
              <p class="field-error" role="alert">This card has expired.</p>
            }
            @if (error(); as e) {
              <p class="alert error" role="alert">{{ e }}</p>
            }
            <button type="submit" class="btn block" [disabled]="paying() || mismatch()">
              {{
                paying()
                  ? 'Processing…'
                  : 'Pay ' + (p.price | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN')
              }}
            </button>
            <p class="muted small secure">
              🔒 Card details are sent once for authorisation and never stored.
            </p>
          </form>
        </div>
      } @else {
        <p class="muted">Loading plan…</p>
      }
    </div>
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 1rem;
      align-items: start;
      margin-top: 1rem;
    }
    dl {
      display: grid;
      gap: 0.6rem;
      margin: 0;
    }
    dl div {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
      text-align: right;
      font-weight: 600;
    }
    .total {
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
      font-size: 1.2rem;
    }
    .secure {
      text-align: center;
      margin-top: 0.75rem;
    }
    @media (max-width: 860px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class RechargeComponent {
  private readonly plans = inject(PlansService);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Route param `planId`. */
  readonly planId = input.required<string>();

  protected readonly loadError = signal<string | null>(null);
  protected readonly plan = toSignal(
    toObservable(this.planId).pipe(
      switchMap((id) =>
        this.plans.get(Number(id)).pipe(
          catchError((err) => {
            this.loadError.set(errorMessage(err));
            return of(null);
          }),
        ),
      ),
    ),
    { initialValue: null as Plan | null },
  );
  protected readonly account = toSignal(
    this.accountService.summary().pipe(catchError(() => of(null))),
    { initialValue: null as AccountSummary | null },
  );
  protected readonly mismatch = computed(() => {
    const p = this.plan();
    const a = this.account();
    return !!p && !!a && p.category !== a.customer.connection_type;
  });
  protected readonly benefits = computed(() => {
    const p = this.plan();
    if (!p) return '';
    return p.speed
      ? `${p.speed}, ${p.data}, ${p.post_fup_speed} after FUP`
      : [p.data + ' data', p.calls && `${p.calls} calls`, p.sms && `${p.sms} SMS`]
          .filter(Boolean)
          .join(', ');
  });

  protected readonly paying = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly brand = signal('');
  protected readonly months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label:
      new Date(2000, i, 1).toLocaleString('en', { month: 'short' }) +
      ` (${String(i + 1).padStart(2, '0')})`,
  }));
  protected readonly years = Array.from({ length: 12 }, (_, i) =>
    String(new Date().getFullYear() + i),
  );

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      cardholder_name: ['', [Validators.required, Validators.minLength(2)]],
      number: ['', [Validators.required, cardNumberValidator]],
      exp_month: ['', Validators.required],
      exp_year: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    },
    { validators: notExpired },
  );

  protected formatNumber(): void {
    const c = this.form.controls.number;
    const digits = digitsOnly(c.value).slice(0, 19);
    const grouped = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (grouped !== c.value) c.setValue(grouped, { emitEvent: false });
    this.brand.set(cardBrand(digits));
  }

  protected pay(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.paying.set(true);
    this.error.set(null);
    this.accountService
      .recharge(this.plan()!.id, {
        cardholder_name: v.cardholder_name,
        number: digitsOnly(v.number),
        exp_month: Number(v.exp_month),
        exp_year: Number(v.exp_year),
        cvv: v.cvv,
      })
      .subscribe({
        next: (bill) => {
          this.toast.show('Recharge successful! A receipt was sent by e-mail and SMS.');
          this.router.navigate(['/recharge/success', bill.id]);
        },
        error: (err) => {
          this.paying.set(false);
          applyServerErrors(this.form, fieldErrors(err));
          this.error.set(errorMessage(err));
        },
      });
  }
}
