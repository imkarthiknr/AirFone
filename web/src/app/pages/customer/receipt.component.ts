import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http-error';
import { Bill } from '../../core/models';
import { AccountService } from '../../core/services/account.service';

/** Recharge success + printable invoice; leads to Feedback like the original flow. */
@Component({
  selector: 'app-receipt',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="container page">
      @if (error(); as e) {
        <p class="alert error">{{ e }}</p>
      } @else if (bill(); as b) {
        <article class="card medium invoice">
          <div class="tick" aria-hidden="true">✓</div>
          <h1>Recharge successful</h1>
          <p class="muted">
            Invoice <span class="mono">{{ b.invoice_no }}</span>
          </p>
          <dl>
            <div>
              <dt>Plan</dt>
              <dd>
                {{ b.plan_name }} <span class="badge {{ b.category }}">{{ b.category }}</span>
              </dd>
            </div>
            <div>
              <dt>Benefits</dt>
              <dd>{{ b.benefits }}</dd>
            </div>
            <div>
              <dt>Valid</dt>
              <dd>{{ b.start_date | date: 'd MMM y' }} – {{ b.end_date | date: 'd MMM y' }}</dd>
            </div>
            @if (b.payment; as pay) {
              <div>
                <dt>Paid with</dt>
                <dd>{{ pay.card_brand }} •••• {{ pay.card_last4 }}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd class="mono">{{ pay.reference }}</dd>
              </div>
            }
            <div class="total">
              <dt>Amount paid</dt>
              <dd>{{ b.amount | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}</dd>
            </div>
          </dl>
          <div class="actions no-print">
            <a routerLink="/dashboard" class="btn">Go to dashboard</a>
            <button type="button" class="btn ghost" (click)="print()">Print invoice</button>
            <a routerLink="/feedback" class="btn secondary">Rate your experience</a>
          </div>
        </article>
      } @else {
        <p class="muted">Loading receipt…</p>
      }
    </div>
  `,
  styles: `
    .invoice {
      text-align: center;
    }
    .tick {
      width: 3.5rem;
      height: 3.5rem;
      margin: 0 auto 0.75rem;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--success-soft);
      color: var(--success);
      font-size: 1.8rem;
      font-weight: 900;
    }
    dl {
      display: grid;
      gap: 0.6rem;
      margin: 1.25rem 0 0;
      text-align: left;
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
    .actions {
      justify-content: center;
    }
    @media print {
      .no-print {
        display: none;
      }
    }
  `,
})
export class ReceiptComponent {
  private readonly account = inject(AccountService);
  readonly billId = input.required<string>();
  protected readonly bill = signal<Bill | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.account.bill(Number(this.billId())).subscribe({
      next: (b) => this.bill.set(b),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  protected print(): void {
    window.print();
  }
}
