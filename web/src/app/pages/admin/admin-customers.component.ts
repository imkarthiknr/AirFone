import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Subject,
  debounceTime,
  startWith,
  switchMap,
  combineLatest,
  catchError,
  of,
  map,
} from 'rxjs';
import { errorMessage } from '../../core/http-error';
import { Customer, PLAN_CATEGORIES, Page, PlanCategory } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';

/** The original "Customer Details" page: list, search and filter customers. */
@Component({
  selector: 'app-admin-customers',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-head">
      <h1>Customers</h1>
      @if (page(); as p) {
        <p class="muted">{{ p.total }} total</p>
      }
    </div>
    <div class="row filters">
      <label class="visually-hidden" for="q">Search</label>
      <input id="q" type="search" [formControl]="q" placeholder="Search name, email or mobile" />
      <label class="visually-hidden" for="type">Connection type</label>
      <select id="type" [formControl]="type">
        <option value="">All types</option>
        @for (c of categories; track c) {
          <option [value]="c">{{ c }}</option>
        }
      </select>
    </div>
    @if (error(); as e) {
      <p class="alert error">{{ e }}</p>
    }
    @if (page(); as p) {
      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mobile</th>
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>Type</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (c of p.items; track c.id) {
              <tr>
                <td class="mono">{{ c.mobile_no }}</td>
                <td>{{ c.name }}</td>
                <td>{{ c.email }}</td>
                <td>{{ c.city }}</td>
                <td>
                  <span class="badge {{ c.connection_type }}">{{ c.connection_type }}</span>
                </td>
                <td>
                  <span
                    class="badge"
                    [class.active]="c.is_active"
                    [class.inactive]="!c.is_active"
                    >{{ c.is_active ? 'active' : 'inactive' }}</span
                  >
                </td>
                <td><a [routerLink]="['/admin/customers', c.id]">Manage</a></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty">No customers match.</td>
              </tr>
            }
          </tbody>
        </table>
        @if (p.pages > 1) {
          <nav class="pager" aria-label="Pagination">
            <button class="btn ghost small" [disabled]="p.page <= 1" (click)="go(p.page - 1)">
              ← Previous
            </button>
            <span class="muted">Page {{ p.page }} of {{ p.pages }}</span>
            <button class="btn ghost small" [disabled]="p.page >= p.pages" (click)="go(p.page + 1)">
              Next →
            </button>
          </nav>
        }
      </div>
    }
  `,
  styles: `
    .filters {
      margin-bottom: 1rem;
    }
    .filters input {
      flex: 1;
      min-width: 14rem;
    }
    .filters select {
      width: auto;
      text-transform: capitalize;
    }
  `,
})
export class AdminCustomersComponent {
  private readonly admin = inject(AdminService);
  protected readonly categories = PLAN_CATEGORIES;
  protected readonly q = new FormControl('', { nonNullable: true });
  protected readonly type = new FormControl<PlanCategory | ''>('', { nonNullable: true });
  protected readonly page = signal<Page<Customer> | null>(null);
  protected readonly error = signal<string | null>(null);
  private readonly pageNo$ = new Subject<number>();

  constructor() {
    const filters$ = combineLatest([
      this.q.valueChanges.pipe(debounceTime(250), startWith('')),
      this.type.valueChanges.pipe(startWith('' as PlanCategory | '')),
    ]);
    filters$
      .pipe(
        switchMap(([q, type]) =>
          this.pageNo$.pipe(
            startWith(1),
            switchMap((n) =>
              this.admin.customers(q.trim(), type, n).pipe(
                map((p) => ({ p, e: null as string | null })),
                catchError((err) => of({ p: null, e: errorMessage(err) })),
              ),
            ),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ p, e }) => {
        this.error.set(e);
        if (p) this.page.set(p);
      });
  }

  protected go(n: number): void {
    this.pageNo$.next(n);
  }
}
