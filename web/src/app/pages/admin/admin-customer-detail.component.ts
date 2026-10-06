import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http-error';
import { Bill, Customer, PLAN_CATEGORIES, PlanCategory } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldErrorComponent } from '../../shared/field-error.component';

/** The original "Customer Update" page, plus bill history, reset link and delete. */
@Component({
  selector: 'app-admin-customer-detail',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, DatePipe, CurrencyPipe],
  template: `
    <a routerLink="/admin/customers" class="small">← Customers</a>
    @if (error(); as e) {
      <p class="alert error">{{ e }}</p>
    } @else if (customer(); as c) {
      <div class="page-head">
        <div>
          <h1>{{ c.name }}</h1>
          <p class="muted mono">{{ c.mobile_no }} · {{ c.email }}</p>
        </div>
      </div>
      <div class="grid-2">
        <section class="card">
          <h2>Details</h2>
          <dl>
            <div>
              <dt>Date of birth</dt>
              <dd>{{ c.dob | date: 'd MMM y' }}</dd>
            </div>
            <div>
              <dt>Occupation</dt>
              <dd>{{ c.occupation }}</dd>
            </div>
            <div>
              <dt>Aadhaar</dt>
              <dd class="mono">{{ c.aadhaar_masked }}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{{ c.house_no }}, {{ c.street }}, {{ c.city }}, {{ c.state }} {{ c.pincode }}</dd>
            </div>
            <div>
              <dt>Customer since</dt>
              <dd>{{ c.created_at | date: 'd MMM y' }}</dd>
            </div>
          </dl>
        </section>

        <form class="card" [formGroup]="form" (ngSubmit)="save()" novalidate>
          <h2>Update customer</h2>
          <div class="field">
            <label for="name">Name</label>
            <input id="name" formControlName="name" />
            <app-field-error [control]="form.controls.name" />
          </div>
          <div class="field">
            <label for="type">Connection type</label>
            <select id="type" formControlName="connection_type">
              @for (t of categories; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
          </div>
          <label class="check"
            ><input type="checkbox" formControlName="is_active" /> Account active (can log
            in)</label
          >
          <div class="actions">
            <button type="submit" class="btn" [disabled]="form.pristine || busy()">Update</button>
            <button type="button" class="btn ghost" (click)="sendReset()" [disabled]="busy()">
              Send password reset link
            </button>
          </div>
          <hr />
          @if (!confirmDelete()) {
            <button type="button" class="btn danger" (click)="confirmDelete.set(true)">
              Delete customer…
            </button>
          } @else {
            <p class="alert error">
              This permanently deletes {{ c.name }}, their bills and complaints.
            </p>
            <div class="row">
              <button type="button" class="btn danger" (click)="remove()">Yes, delete</button>
              <button type="button" class="btn ghost" (click)="confirmDelete.set(false)">
                Cancel
              </button>
            </div>
          }
        </form>
      </div>

      <section class="card bills">
        <h2>Bill history</h2>
        @if (!bills().length) {
          <p class="empty">No bills yet.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Plan</th>
                  <th>Start</th>
                  <th>End</th>
                  <th class="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                @for (b of bills(); track b.id) {
                  <tr>
                    <td class="mono">{{ b.invoice_no }}</td>
                    <td>{{ b.plan_name }}</td>
                    <td>{{ b.start_date | date: 'd MMM y' }}</td>
                    <td>{{ b.end_date | date: 'd MMM y' }}</td>
                    <td class="num">
                      {{ b.amount | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    } @else {
      <p class="muted">Loading…</p>
    }
  `,
  styles: `
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
    .check {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }
    .check input {
      width: auto;
    }
    select {
      text-transform: capitalize;
    }
    hr {
      border: 0;
      border-top: 1px solid var(--border);
      margin: 1.25rem 0;
    }
    .bills {
      margin-top: 1rem;
    }
  `,
})
export class AdminCustomerDetailComponent {
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly id = input.required<string>();

  protected readonly categories = PLAN_CATEGORIES;
  protected readonly customer = signal<Customer | null>(null);
  protected readonly bills = signal<Bill[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly confirmDelete = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    connection_type: ['prepaid' as PlanCategory, Validators.required],
    is_active: [true],
  });

  ngOnInit(): void {
    const id = Number(this.id());
    this.admin.customer(id).subscribe({
      next: (c) => this.set(c),
      error: (err) => this.error.set(errorMessage(err)),
    });
    this.admin.customerBills(id).subscribe({ next: (b) => this.bills.set(b) });
  }

  private set(c: Customer): void {
    this.customer.set(c);
    this.form.reset({ name: c.name, connection_type: c.connection_type, is_active: c.is_active });
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.busy.set(true);
    this.admin.updateCustomer(this.customer()!.id, this.form.getRawValue()).subscribe({
      next: (c) => {
        this.busy.set(false);
        this.set(c);
        this.toast.show('Customer updated.');
      },
      error: (err) => {
        this.busy.set(false);
        this.toast.show(errorMessage(err), 'error');
      },
    });
  }

  protected sendReset(): void {
    this.admin.sendPasswordReset(this.customer()!.id).subscribe({
      next: (r) => this.toast.show(r.detail),
      error: (err) => this.toast.show(errorMessage(err), 'error'),
    });
  }

  protected remove(): void {
    const c = this.customer()!;
    this.admin.deleteCustomer(c.id).subscribe({
      next: () => {
        this.toast.show(`${c.name} was deleted.`);
        this.router.navigateByUrl('/admin/customers');
      },
      error: (err) => this.toast.show(errorMessage(err), 'error'),
    });
  }
}
