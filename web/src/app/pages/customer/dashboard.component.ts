import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { errorMessage } from '../../core/http-error';
import { AccountSummary } from '../../core/models';
import { AccountService } from '../../core/services/account.service';

/** Customer home: current pack, quick actions and the original "ads" highlights. */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="container page">
      @if (error(); as e) {
        <p class="alert error">{{ e }}</p>
      }
      @if (summary(); as s) {
        <div class="page-head">
          <div>
            <h1>Hi, {{ s.customer.name.split(' ')[0] }} 👋</h1>
            <p class="muted">
              <span class="mono">{{ s.customer.mobile_no }}</span> ·
              <span class="badge {{ s.customer.connection_type }}">{{
                s.customer.connection_type
              }}</span>
            </p>
          </div>
          <a class="btn" [routerLink]="['/plans', s.customer.connection_type]">Recharge now</a>
        </div>

        <div class="grid-4">
          <div class="card stat current" [class.none]="!s.active_bill">
            <div class="label">Current pack</div>
            @if (s.active_bill; as b) {
              <div class="value">{{ b.plan_name }}</div>
              <div class="small">{{ b.benefits }}</div>
              <div class="small">
                @if (s.days_left === 0) {
                  <b>Expires today</b>
                } @else {
                  <b>{{ s.days_left }} days left</b>
                }
                · till {{ b.end_date | date: 'd MMM y' }}
              </div>
            } @else {
              <div class="value">No active pack</div>
              <a class="small" [routerLink]="['/plans', s.customer.connection_type]"
                >Choose a plan →</a
              >
            }
          </div>
          <div class="card stat">
            <div class="label">Total spent</div>
            <div class="value">
              {{ s.total_spent | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}
            </div>
          </div>
          <div class="card stat">
            <div class="label">Recharges</div>
            <div class="value">{{ s.recharge_count }}</div>
            <a routerLink="/history" class="small">View bills →</a>
          </div>
          <div class="card stat">
            <div class="label">Open complaints</div>
            <div class="value">{{ s.open_tickets }}</div>
            <a routerLink="/help/support" class="small">Support →</a>
          </div>
        </div>

        <h2 class="section-title">Quick actions</h2>
        <div class="grid-4 quick">
          <a class="card" [routerLink]="['/plans', s.customer.connection_type]"
            ><span aria-hidden="true">⚡</span>Recharge</a
          >
          <a class="card" routerLink="/history"><span aria-hidden="true">🧾</span>Bill history</a>
          <a class="card" routerLink="/help/support"
            ><span aria-hidden="true">🛟</span>Raise a complaint</a
          >
          <a class="card" routerLink="/profile"><span aria-hidden="true">👤</span>My profile</a>
        </div>
      } @else if (!error()) {
        <p class="muted">Loading your account…</p>
      }

      <h2 class="section-title">What's new at AirFone</h2>
      <div class="ads">
        @for (ad of ads; track ad.title) {
          <article class="card ad">
            <span class="ad-icon" aria-hidden="true">{{ ad.icon }}</span>
            <div>
              <h3>{{ ad.title }}</h3>
              <p class="muted">{{ ad.text }}</p>
              <a [routerLink]="ad.link">{{ ad.cta }} →</a>
            </div>
          </article>
        }
      </div>
    </div>
  `,
  styles: `
    .current {
      grid-column: span 1;
      background: var(--hero);
      color: #fff;
      border: 0;
    }
    .current .label,
    .current a {
      color: rgb(255 255 255 / 85%);
    }
    .current .value {
      font-size: 1.3rem;
    }
    .current.none {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .current.none .label {
      color: var(--muted);
    }
    .current.none a {
      color: var(--primary);
    }
    .section-title {
      margin: 2rem 0 0.9rem;
    }
    .quick a {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 700;
      text-decoration: none;
      color: inherit;
      padding: 1.1rem 1.25rem;
    }
    .quick a:hover {
      border-color: var(--primary);
    }
    .quick span {
      font-size: 1.4rem;
    }
    .ads {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .ad {
      display: flex;
      gap: 1rem;
    }
    .ad-icon {
      font-size: 2rem;
    }
    @media (max-width: 860px) {
      .ads {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class DashboardComponent {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  protected readonly summary = signal<AccountSummary | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly ads = [
    {
      icon: '📱',
      title: 'No.1 prepaid network',
      text: 'High-grade security and 24×7 local support. Daily data that never makes you wait.',
      cta: 'Prepaid plans',
      link: '/plans/prepaid',
    },
    {
      icon: '🧾',
      title: 'Exclusive postpaid',
      text: 'Annual plans up to 200GB with unlimited calls and SMS. One bill, zero hassle.',
      cta: 'Postpaid plans',
      link: '/plans/postpaid',
    },
    {
      icon: '🛜',
      title: 'Best broadband',
      text: 'Air-Fone fibernet up to 2 Gbps across all your devices, with generous FUP.',
      cta: 'Broadband plans',
      link: '/plans/broadband',
    },
    {
      icon: '💬',
      title: 'Customer service that answers',
      text: 'Every complaint gets a ticket number, an owner and a written reply.',
      cta: 'Get help',
      link: '/help',
    },
  ];

  ngOnInit(): void {
    this.account.summary().subscribe({
      next: (s) => {
        this.summary.set(s);
        this.auth.setLabel(s.customer.name);
      },
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
