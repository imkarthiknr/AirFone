import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { errorMessage } from '../../core/http-error';
import { Ticket } from '../../core/models';
import { AccountService } from '../../core/services/account.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldErrorComponent } from '../../shared/field-error.component';

/** Register a complaint (the original Support page) and track your tickets. */
@Component({
  selector: 'app-support',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, DatePipe],
  template: `
    <div class="container page">
      <h1>Support</h1>
      @if (!auth.isCustomer()) {
        <div class="card medium">
          <p>Please log in so we can link the complaint to your number and keep you updated.</p>
          <a class="btn" routerLink="/login" [queryParams]="{ returnUrl: '/help/support' }"
            >Log in to continue</a
          >
        </div>
      } @else {
        <div class="layout">
          <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <h2>Register a complaint</h2>
            <div class="field">
              <label for="description">What's going wrong?</label>
              <textarea
                id="description"
                formControlName="description"
                rows="5"
                placeholder="E.g. calls drop every evening near Anna Nagar since Monday"
              ></textarea>
              <app-field-error [control]="form.controls.description" />
            </div>
            @if (error(); as e) {
              <p class="alert error" role="alert">{{ e }}</p>
            }
            <button type="submit" class="btn" [disabled]="busy()">Submit complaint</button>
          </form>

          <section class="card">
            <h2>My complaints</h2>
            @if (tickets().length === 0) {
              <p class="empty">No complaints yet.</p>
            }
            <ul class="tickets">
              @for (t of tickets(); track t.id) {
                <li>
                  <div class="row between">
                    <strong class="mono">{{ t.ticket_no }}</strong>
                    <span class="badge {{ t.status }}">{{ t.status }}</span>
                  </div>
                  <p>{{ t.description }}</p>
                  <p class="muted small">
                    Raised {{ t.created_at | date: 'medium' }} · Assigned to {{ t.assigned_to }}
                  </p>
                  @if (t.response) {
                    <blockquote><strong>Our reply:</strong> {{ t.response }}</blockquote>
                  }
                </li>
              }
            </ul>
          </section>
        </div>
      }
    </div>
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 1rem;
      align-items: start;
    }
    .tickets {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 1rem;
    }
    .tickets li {
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .tickets li:last-child {
      border-bottom: 0;
    }
    .between {
      justify-content: space-between;
    }
    blockquote {
      margin: 0.5rem 0 0;
      padding: 0.6rem 0.9rem;
      background: var(--success-soft);
      border-radius: 8px;
    }
    @media (max-width: 860px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class SupportComponent {
  protected readonly auth = inject(AuthService);
  private readonly account = inject(AccountService);
  private readonly toast = inject(ToastService);
  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    if (this.auth.isCustomer()) this.load();
  }

  private load(): void {
    this.account.tickets().subscribe({ next: (t) => this.tickets.set(t) });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.account.raiseTicket(this.form.getRawValue().description).subscribe({
      next: (t) => {
        this.busy.set(false);
        this.form.reset();
        this.tickets.update((list) => [t, ...list]);
        this.toast.show(`Complaint registered as ${t.ticket_no}, assigned to ${t.assigned_to}.`);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
