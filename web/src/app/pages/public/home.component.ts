import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PlansService } from '../../core/services/plans.service';
import { PlanCardComponent } from '../../shared/plan-card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, PlanCardComponent],
  template: `
    <section class="hero">
      <div class="container hero-inner">
        <div>
          <p class="eyebrow">AirFone Telecom</p>
          <h1>Connecting people, one plan at a time.</h1>
          <p class="lead">
            Prepaid, postpaid and fiber broadband with instant recharge, clear bills and support
            that actually answers.
          </p>
          <div class="row">
            @if (auth.isCustomer()) {
              <a routerLink="/dashboard" class="btn light">Go to dashboard</a>
            } @else {
              <a routerLink="/register" class="btn light">Get a new connection</a>
              <a routerLink="/login" class="btn outline">Log in &amp; recharge</a>
            }
          </div>
        </div>
        <ul class="hero-points" aria-label="Highlights">
          <li><strong>27</strong><span>plans across 3 categories</span></li>
          <li><strong>2 Gbps</strong><span>top fiber speed</span></li>
          <li><strong>24×7</strong><span>support tickets</span></li>
        </ul>
      </div>
    </section>

    <section class="container section">
      <h2>Choose how you connect</h2>
      <div class="grid-3">
        @for (c of categories; track c.key) {
          <a class="category card" [routerLink]="['/plans', c.key]">
            <span class="icon" aria-hidden="true">{{ c.icon }}</span>
            <h3>{{ c.title }}</h3>
            <p class="muted">{{ c.text }}</p>
            <span class="more">See {{ c.key }} plans →</span>
          </a>
        }
      </div>
    </section>

    @if (popular().length) {
      <section class="container section">
        <div class="page-head">
          <h2>Popular right now</h2>
          <a routerLink="/plans">All plans →</a>
        </div>
        <div class="grid-3">
          @for (p of popular(); track p.id) {
            <app-plan-card [plan]="p" />
          }
        </div>
      </section>
    }

    <section class="container section">
      <h2>Why AirFone</h2>
      <div class="grid-4 why">
        <div>
          <h3>Building trust</h3>
          <p class="muted">Transparent pricing. What you see on a plan is what you pay.</p>
        </div>
        <div>
          <h3>We value our customers</h3>
          <p class="muted">Every complaint gets a ticket, an owner and a written reply.</p>
        </div>
        <div>
          <h3>Top service provider</h3>
          <p class="muted">4G across the country and fiber up to 2 Gbps in metro cities.</p>
        </div>
        <div>
          <h3>Wide range of offers</h3>
          <p class="muted">From a ₹19 data top-up to annual postpaid and gigabit fiber.</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero {
      background: var(--hero);
      color: #fff;
    }
    .hero-inner {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 2rem;
      align-items: center;
      padding-top: 4rem;
      padding-bottom: 4rem;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.8rem;
      font-weight: 700;
      opacity: 0.85;
    }
    h1 {
      font-size: clamp(2rem, 4.5vw, 3rem);
      color: #fff;
    }
    .lead {
      font-size: 1.15rem;
      opacity: 0.92;
      max-width: 34rem;
      margin-bottom: 1.5rem;
    }
    .btn.light {
      background: #fff;
      color: #0044ad;
      border-color: #fff;
    }
    .btn.outline {
      background: transparent;
      color: #fff;
      border-color: rgb(255 255 255 / 70%);
    }
    .hero-points {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.75rem;
    }
    .hero-points li {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      padding: 0.9rem 1.1rem;
      background: rgb(255 255 255 / 12%);
      border: 1px solid rgb(255 255 255 / 20%);
      border-radius: 12px;
    }
    .hero-points strong {
      font-size: 1.5rem;
    }
    .section {
      padding-top: 2.75rem;
    }
    .category {
      display: grid;
      gap: 0.35rem;
      text-decoration: none;
      color: inherit;
      transition:
        border-color 0.15s,
        transform 0.15s;
    }
    .category:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
    }
    .icon {
      font-size: 1.8rem;
    }
    .more {
      color: var(--primary);
      font-weight: 600;
    }
    .why h3 {
      font-size: 1rem;
    }
    @media (max-width: 860px) {
      .hero-inner {
        grid-template-columns: 1fr;
        padding-top: 2.5rem;
        padding-bottom: 2.5rem;
      }
    }
  `,
})
export class HomeComponent {
  protected readonly auth = inject(AuthService);
  private readonly plans = toSignal(
    inject(PlansService)
      .all()
      .pipe(catchError(() => of([]))),
    {
      initialValue: [],
    },
  );
  protected readonly popular = computed(() =>
    this.plans()
      .filter((p) => p.is_popular)
      .slice(0, 3),
  );
  protected readonly categories = [
    {
      key: 'prepaid',
      icon: '📱',
      title: 'Prepaid',
      text: 'No.1 prepaid network. Recharge anytime, from ₹19.',
    },
    {
      key: 'postpaid',
      icon: '🧾',
      title: 'Postpaid',
      text: 'Exclusive monthly and annual plans with big data.',
    },
    {
      key: 'broadband',
      icon: '🛜',
      title: 'Broadband',
      text: 'Fiber from 150 Mbps to 2 Gbps for the whole home.',
    },
  ];
}
