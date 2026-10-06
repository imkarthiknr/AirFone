import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http-error';
import { AdminStats, PLAN_CATEGORIES, Satisfaction } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <h1>Dashboard</h1>
    @if (error(); as e) {
      <p class="alert error">{{ e }}</p>
    }
    @if (stats(); as s) {
      <div class="grid-4">
        <a class="card stat" routerLink="/admin/customers">
          <div class="label">Customers</div>
          <div class="value">{{ totalCustomers() }}</div>
        </a>
        <a class="card stat" routerLink="/admin/tickets" [queryParams]="{ status: 'open' }">
          <div class="label">Open complaints</div>
          <div class="value">{{ s.open_tickets }}</div>
        </a>
        <a class="card stat" routerLink="/admin/billing">
          <div class="label">Revenue this month</div>
          <div class="value">
            {{ s.revenue_this_month | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}
          </div>
        </a>
        <a class="card stat" routerLink="/admin/billing">
          <div class="label">Recharges this month</div>
          <div class="value">{{ s.recharges_this_month }}</div>
        </a>
      </div>

      <div class="grid-2 charts">
        <section class="card">
          <h2>Customers by connection</h2>
          @for (c of categories; track c) {
            <div class="bar-row">
              <span class="name"
                ><span class="badge {{ c }}">{{ c }}</span></span
              >
              <span class="track"
                ><span
                  class="fill {{ c }}"
                  [style.width.%]="pct(s.customers_by_type[c], totalCustomers())"
                ></span
              ></span>
              <span class="count">{{ s.customers_by_type[c] }}</span>
            </div>
          }
        </section>
        <section class="card">
          <h2>Customer feedback</h2>
          @for (f of feedbackKinds; track f.key) {
            <div class="bar-row">
              <span class="name">{{ f.emoji }} {{ f.label }}</span>
              <span class="track"
                ><span
                  class="fill fb"
                  [style.width.%]="pct(s.feedback_breakdown[f.key] ?? 0, totalFeedback())"
                ></span
              ></span>
              <span class="count">{{ s.feedback_breakdown[f.key] ?? 0 }}</span>
            </div>
          }
          <a routerLink="/admin/feedback" class="small">Read feedback →</a>
        </section>
      </div>
    }
  `,
  styles: `
    a.stat {
      text-decoration: none;
      color: inherit;
    }
    a.stat:hover {
      border-color: var(--primary);
    }
    .charts {
      margin-top: 1rem;
    }
    .bar-row {
      display: grid;
      grid-template-columns: 8rem 1fr 2.5rem;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .track {
      height: 0.7rem;
      background: var(--surface-2);
      border-radius: 999px;
      overflow: hidden;
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: var(--primary);
    }
    .fill.postpaid {
      background: var(--accent);
    }
    .fill.broadband {
      background: var(--warning);
    }
    .fill.fb {
      background: var(--accent);
    }
    .count {
      text-align: right;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class AdminDashboardComponent {
  private readonly admin = inject(AdminService);
  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly categories = PLAN_CATEGORIES;
  protected readonly feedbackKinds: { key: Satisfaction; label: string; emoji: string }[] = [
    { key: 'excellent', label: 'Excellent', emoji: '🤩' },
    { key: 'good', label: 'Good', emoji: '😀' },
    { key: 'average', label: 'Average', emoji: '😐' },
    { key: 'bad', label: 'Bad', emoji: '☹️' },
  ];
  protected readonly totalCustomers = computed(() =>
    Object.values(this.stats()?.customers_by_type ?? {}).reduce((a, b) => a + b, 0),
  );
  protected readonly totalFeedback = computed(() =>
    Object.values(this.stats()?.feedback_breakdown ?? {}).reduce((a, b) => a + (b ?? 0), 0),
  );

  ngOnInit(): void {
    this.admin.stats().subscribe({
      next: (s) => this.stats.set(s),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  protected pct(n: number, total: number): number {
    return total ? Math.round((n / total) * 100) : 0;
  }
}
