import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { errorMessage } from '../../core/http-error';
import { Feedback, Notification, Page } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';

const EMOJI: Record<string, string> = { excellent: '🤩', good: '😀', average: '😐', bad: '☹️' };

@Component({
  selector: 'app-admin-feedback',
  imports: [DatePipe, TitleCasePipe],
  template: `
    <h1>Customer feedback</h1>
    @if (error(); as e) {
      <p class="alert error">{{ e }}</p>
    }
    @if (page(); as p) {
      <div class="stack">
        @for (f of p.items; track f.id) {
          <article class="card">
            <div class="row between">
              <strong>{{ emoji(f.satisfaction) }} {{ f.satisfaction | titlecase }}</strong>
              <span class="muted small">{{ f.created_at | date: 'medium' }}</span>
            </div>
            @if (f.comments) {
              <p>{{ f.comments }}</p>
            }
            <p class="muted small">{{ f.name }} · {{ f.email }}</p>
          </article>
        } @empty {
          <p class="empty card">No feedback yet.</p>
        }
      </div>
      @if (p.pages > 1) {
        <nav class="pager">
          <button class="btn ghost small" [disabled]="p.page <= 1" (click)="load(p.page - 1)">
            ← Newer
          </button>
          <span class="muted">Page {{ p.page }} of {{ p.pages }}</span>
          <button class="btn ghost small" [disabled]="p.page >= p.pages" (click)="load(p.page + 1)">
            Older →
          </button>
        </nav>
      }
    }
  `,
  styles: `
    .between {
      justify-content: space-between;
    }
    article p {
      margin: 0.5rem 0 0;
    }
  `,
})
export class AdminFeedbackComponent {
  private readonly admin = inject(AdminService);
  protected readonly page = signal<Page<Feedback> | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(1);
  }

  protected load(n: number): void {
    this.admin.feedback(n).subscribe({
      next: (p) => this.page.set(p),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  protected emoji(s: string): string {
    return EMOJI[s] ?? '';
  }
}

/** Outbox: every e-mail and SMS the system has sent (replaces hard-coded SMTP/SMS calls). */
@Component({
  selector: 'app-admin-outbox',
  imports: [DatePipe],
  template: `
    <div class="page-head">
      <div>
        <h1>Outbox</h1>
        <p class="muted">
          Every e-mail and SMS AirFone has sent. Delivered via SMTP when configured.
        </p>
      </div>
    </div>
    @if (error(); as e) {
      <p class="alert error">{{ e }}</p>
    }
    @if (page(); as p) {
      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Channel</th>
              <th>To</th>
              <th>Subject</th>
              <th>Delivered</th>
            </tr>
          </thead>
          <tbody>
            @for (n of p.items; track n.id) {
              <tr>
                <td class="small">{{ n.created_at | date: 'd MMM, h:mm a' }}</td>
                <td>
                  <span class="badge">{{ n.channel }}</span>
                </td>
                <td class="mono small">{{ n.recipient }}</td>
                <td>
                  <details>
                    <summary>{{ n.subject }}</summary>
                    <pre>{{ n.body }}</pre>
                  </details>
                </td>
                <td>{{ n.delivered ? 'Yes' : 'Logged only' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty">Nothing sent yet.</td>
              </tr>
            }
          </tbody>
        </table>
        @if (p.pages > 1) {
          <nav class="pager">
            <button class="btn ghost small" [disabled]="p.page <= 1" (click)="load(p.page - 1)">
              ← Newer
            </button>
            <span class="muted">Page {{ p.page }} of {{ p.pages }}</span>
            <button
              class="btn ghost small"
              [disabled]="p.page >= p.pages"
              (click)="load(p.page + 1)"
            >
              Older →
            </button>
          </nav>
        }
      </div>
    }
  `,
  styles: `
    summary {
      cursor: pointer;
    }
    pre {
      white-space: pre-wrap;
      font: inherit;
      font-size: 0.88rem;
      margin: 0.5rem 0 0;
      color: var(--muted);
    }
  `,
})
export class AdminOutboxComponent {
  private readonly admin = inject(AdminService);
  protected readonly page = signal<Page<Notification> | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(1);
  }

  protected load(n: number): void {
    this.admin.notifications(n).subscribe({
      next: (p) => this.page.set(p),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
