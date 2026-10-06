import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http-error';
import { Bill } from '../../core/models';
import { AccountService } from '../../core/services/account.service';

/** Customer bill history (the original History page). */
@Component({
  selector: 'app-history',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="container page">
      <div class="page-head">
        <div>
          <h1>Bill history</h1>
          <p class="muted">Every recharge on your number.</p>
        </div>
        @if (bills().length) {
          <p class="muted">
            Total: <b>{{ total() | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}</b>
          </p>
        }
      </div>
      @if (error(); as e) {
        <p class="alert error">{{ e }}</p>
      } @else if (loading()) {
        <p class="muted">Loading…</p>
      } @else if (!bills().length) {
        <div class="card empty">
          <p>No recharges yet.</p>
          <a routerLink="/plans" class="btn">Browse plans</a>
        </div>
      } @else {
        <div class="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Plan</th>
                <th>Benefits</th>
                <th>Valid</th>
                <th>Status</th>
                <th class="num">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (b of bills(); track b.id) {
                <tr>
                  <td class="mono">{{ b.invoice_no }}</td>
                  <td>{{ b.plan_name }}</td>
                  <td class="muted">{{ b.benefits }}</td>
                  <td>{{ b.start_date | date: 'd MMM y' }} – {{ b.end_date | date: 'd MMM y' }}</td>
                  <td>
                    @if (isActive(b)) {
                      <span class="badge active">Active</span>
                    } @else {
                      <span class="badge">Expired</span>
                    }
                  </td>
                  <td class="num">
                    {{ b.amount | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}
                  </td>
                  <td><a [routerLink]="['/recharge/success', b.id]">Invoice</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class HistoryComponent {
  private readonly account = inject(AccountService);
  protected readonly bills = signal<Bill[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly total = computed(() => this.bills().reduce((s, b) => s + b.amount, 0));
  private readonly today = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    this.account.bills().subscribe({
      next: (b) => {
        this.bills.set(b);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }

  protected isActive(b: Bill): boolean {
    return b.end_date >= this.today;
  }
}
