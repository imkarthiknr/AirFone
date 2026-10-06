import { DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http-error';
import { AdminTicket, Page } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';

/** The original "Complaints Raised" page. Status filter lives in the URL. */
@Component({
  selector: 'app-admin-tickets',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-head">
      <h1>Complaints</h1>
      <nav class="tabs" aria-label="Status">
        <a routerLink="/admin/tickets" [class.active]="!status()">All</a>
        <a
          routerLink="/admin/tickets"
          [queryParams]="{ status: 'open' }"
          [class.active]="status() === 'open'"
          >Open</a
        >
        <a
          routerLink="/admin/tickets"
          [queryParams]="{ status: 'resolved' }"
          [class.active]="status() === 'resolved'"
          >Resolved</a
        >
      </nav>
    </div>
    @if (error(); as e) {
      <p class="alert error">{{ e }}</p>
    }
    @if (page(); as p) {
      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Customer</th>
              <th>Description</th>
              <th>Assigned</th>
              <th>Raised</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (t of p.items; track t.id) {
              <tr>
                <td class="mono">{{ t.ticket_no }}</td>
                <td>
                  {{ t.customer_name }}<br /><span class="muted small mono">{{
                    t.customer_mobile
                  }}</span>
                </td>
                <td class="desc">{{ t.description }}</td>
                <td>{{ t.assigned_to }}</td>
                <td>{{ t.created_at | date: 'd MMM y' }}</td>
                <td>
                  <span class="badge {{ t.status }}">{{ t.status }}</span>
                </td>
                <td>
                  <a [routerLink]="['/admin/tickets', t.id]">{{
                    t.status === 'open' ? 'Respond' : 'View'
                  }}</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty">No complaints here. 🎉</td>
              </tr>
            }
          </tbody>
        </table>
        @if (p.pages > 1) {
          <nav class="pager" aria-label="Pagination">
            <button class="btn ghost small" [disabled]="p.page <= 1" (click)="load(p.page - 1)">
              ← Previous
            </button>
            <span class="muted">Page {{ p.page }} of {{ p.pages }}</span>
            <button
              class="btn ghost small"
              [disabled]="p.page >= p.pages"
              (click)="load(p.page + 1)"
            >
              Next →
            </button>
          </nav>
        }
      </div>
    }
  `,
  styles: `
    .page-head .tabs {
      margin: 0;
    }
    .desc {
      max-width: 22rem;
    }
  `,
})
export class AdminTicketsComponent {
  private readonly admin = inject(AdminService);
  readonly status = input<'open' | 'resolved' | undefined>(undefined);
  protected readonly page = signal<Page<AdminTicket> | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnChanges(): void {
    this.load(1);
  }

  protected load(n: number): void {
    this.admin.tickets(this.status() ?? '', n).subscribe({
      next: (p) => {
        this.error.set(null);
        this.page.set(p);
      },
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}

/** The original "Complaint Respond" page: reply by e-mail and resolve. */
@Component({
  selector: 'app-admin-ticket-respond',
  imports: [RouterLink, DatePipe],
  template: `
    <a routerLink="/admin/tickets" class="small">← Complaints</a>
    @if (error(); as e) {
      <p class="alert error">{{ e }}</p>
    }
    @if (ticket(); as t) {
      <div class="page-head">
        <h1>
          Ticket <span class="mono">{{ t.ticket_no }}</span>
        </h1>
        <span class="badge {{ t.status }}">{{ t.status }}</span>
      </div>
      <div class="grid-2">
        <section class="card">
          <h2>Complaint</h2>
          <dl>
            <div>
              <dt>Customer</dt>
              <dd>{{ t.customer_name }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ t.customer_email }}</dd>
            </div>
            <div>
              <dt>Mobile</dt>
              <dd class="mono">{{ t.customer_mobile }}</dd>
            </div>
            <div>
              <dt>Attender</dt>
              <dd>{{ t.assigned_to }}</dd>
            </div>
            <div>
              <dt>Raised</dt>
              <dd>{{ t.created_at | date: 'medium' }}</dd>
            </div>
          </dl>
          <blockquote>{{ t.description }}</blockquote>
        </section>
        <section class="card">
          <h2>{{ t.status === 'open' ? 'Send response' : 'Response sent' }}</h2>
          @if (t.status === 'resolved') {
            <p>{{ t.response }}</p>
            <p class="muted small">Sent {{ t.responded_at | date: 'medium' }}</p>
          } @else {
            <label for="message">Message to {{ t.customer_name }}</label>
            <textarea
              id="message"
              rows="7"
              [value]="message()"
              (input)="message.set($any($event.target).value)"
              placeholder="Explain what was done and any next steps."
            ></textarea>
            @if (message().trim().length > 0 && message().trim().length < 5) {
              <p class="field-error">Write at least 5 characters.</p>
            }
            <div class="actions">
              <button
                type="button"
                class="btn"
                [disabled]="busy() || message().trim().length < 5"
                (click)="send()"
              >
                {{ busy() ? 'Sending…' : 'Send mail & resolve' }}
              </button>
            </div>
          }
        </section>
      </div>
    }
  `,
  styles: `
    dl {
      display: grid;
      gap: 0.5rem;
      margin: 0 0 1rem;
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
      font-weight: 600;
      text-align: right;
    }
    blockquote {
      margin: 0;
      padding: 0.9rem 1rem;
      background: var(--surface-2);
      border-radius: 10px;
    }
  `,
})
export class AdminTicketRespondComponent {
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  readonly id = input.required<string>();
  protected readonly ticket = signal<AdminTicket | null>(null);
  protected readonly message = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.admin.ticket(Number(this.id())).subscribe({
      next: (t) => this.ticket.set(t),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  protected send(): void {
    this.busy.set(true);
    this.error.set(null);
    this.admin.respond(this.ticket()!.id, this.message().trim()).subscribe({
      next: (t) => {
        this.busy.set(false);
        this.ticket.set(t);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
