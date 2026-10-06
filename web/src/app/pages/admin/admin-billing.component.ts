import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../core/http-error';
import { BillingReport, PLAN_CATEGORIES, PlanCategory } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';

function iso(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** The original "Bill Generation" page: bills in a date range, by type, with CSV export. */
@Component({
  selector: 'app-admin-billing',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <h1>Bill generation</h1>
    <form class="card filters" [formGroup]="form" (ngSubmit)="run()" novalidate>
      <div class="field">
        <label for="start">Start date</label>
        <input id="start" type="date" formControlName="start" />
      </div>
      <div class="field">
        <label for="end">End date</label>
        <input id="end" type="date" formControlName="end" />
      </div>
      <div class="field">
        <label for="category">Type</label>
        <select id="category" formControlName="category">
          <option value="">All types</option>
          @for (c of categories; track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select>
      </div>
      <div class="buttons">
        <button type="submit" class="btn" [disabled]="busy()">Generate</button>
        <button type="button" class="btn ghost" (click)="download()" [disabled]="!report()?.count">
          Download CSV
        </button>
      </div>
    </form>
    @if (error(); as e) {
      <p class="alert error">{{ e }}</p>
    }
    @if (report(); as r) {
      <div class="card table-wrap">
        <p class="muted">
          {{ r.count }} bills from {{ r.start | date: 'd MMM y' }} to {{ r.end | date: 'd MMM y' }}
          @if (r.category) {
            · {{ r.category }}
          }
        </p>
        <table>
          <thead>
            <tr>
              <th>Bill</th>
              <th>Mobile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Date</th>
              <th class="num">Price</th>
            </tr>
          </thead>
          <tbody>
            @for (row of r.rows; track row.invoice_no) {
              <tr>
                <td class="mono">{{ row.invoice_no }}</td>
                <td class="mono">{{ row.mobile_no }}</td>
                <td>{{ row.customer_name }}</td>
                <td>{{ row.email }}</td>
                <td>
                  <span class="badge {{ row.category }}">{{ row.category }}</span>
                </td>
                <td>{{ row.start_date | date: 'd MMM y' }}</td>
                <td class="num">
                  {{ row.amount | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty">No bills in this range.</td>
              </tr>
            }
          </tbody>
          @if (r.count) {
            <tfoot>
              <tr>
                <td colspan="6">Total</td>
                <td class="num">
                  {{ r.total_amount | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}
                </td>
              </tr>
            </tfoot>
          }
        </table>
      </div>
    }
  `,
  styles: `
    .filters {
      display: grid;
      grid-template-columns: repeat(3, 1fr) auto;
      gap: 1rem;
      align-items: end;
      margin-bottom: 1rem;
    }
    .filters .field {
      margin: 0;
    }
    .buttons {
      display: flex;
      gap: 0.5rem;
    }
    select {
      text-transform: capitalize;
    }
    @media (max-width: 860px) {
      .filters {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
})
export class AdminBillingComponent {
  private readonly admin = inject(AdminService);
  protected readonly categories = PLAN_CATEGORIES;
  protected readonly report = signal<BillingReport | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  private readonly today = new Date();
  protected readonly form = inject(NonNullableFormBuilder).group({
    start: [iso(new Date(this.today.getFullYear(), this.today.getMonth(), 1)), Validators.required],
    end: [iso(this.today), Validators.required],
    category: ['' as PlanCategory | ''],
  });

  ngOnInit(): void {
    this.run();
  }

  protected run(): void {
    const { start, end, category } = this.form.getRawValue();
    this.busy.set(true);
    this.error.set(null);
    this.admin.billingReport(start, end, category).subscribe({
      next: (r) => {
        this.busy.set(false);
        this.report.set(r);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }

  protected download(): void {
    const { start, end, category } = this.form.getRawValue();
    this.admin.billingReportCsv(start, end, category).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `airfone-bills-${start}-${end}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
