import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plan } from '../core/models';

/** One plan in the catalogue, with a "Recharge" call to action. */
@Component({
  selector: 'app-plan-card',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="plan" [class.popular]="plan().is_popular" [attr.data-plan-id]="plan().id">
      @if (plan().is_popular) {
        <span class="ribbon">Popular</span>
      }
      <header>
        <span class="badge {{ plan().category }}">{{ plan().category }}</span>
        <h3>{{ plan().name }}</h3>
        <p class="price">
          {{ plan().price | currency: 'INR' : 'symbol' : '1.0-0' : 'en-IN' }}
          <span class="per">/ {{ validity() }}</span>
        </p>
      </header>
      <dl>
        @if (plan().speed) {
          <div>
            <dt>Speed</dt>
            <dd>{{ plan().speed }}</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>{{ plan().data }}</dd>
          </div>
          <div>
            <dt>After FUP</dt>
            <dd>{{ plan().post_fup_speed }}</dd>
          </div>
        } @else {
          <div>
            <dt>Data</dt>
            <dd>{{ plan().data }}</dd>
          </div>
          <div>
            <dt>Calls</dt>
            <dd>{{ plan().calls ?? '—' }}</dd>
          </div>
          <div>
            <dt>SMS</dt>
            <dd>{{ plan().sms ?? '—' }}</dd>
          </div>
        }
      </dl>
      @if (showAction()) {
        <a class="btn block" [routerLink]="['/recharge', plan().id]">Recharge</a>
      }
    </article>
  `,
  styles: `
    .plan {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      height: 100%;
      padding: 1.25rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .plan.popular {
      border-color: var(--primary);
    }
    .ribbon {
      position: absolute;
      top: 0.9rem;
      right: 0.9rem;
      padding: 0.15rem 0.55rem;
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--on-primary);
      background: var(--primary);
      border-radius: 999px;
    }
    h3 {
      margin: 0.5rem 0 0.15rem;
    }
    .price {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .per {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--muted);
    }
    dl {
      display: grid;
      gap: 0.35rem;
      margin: 0;
      flex: 1;
    }
    dl div {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.92rem;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
      font-weight: 600;
      text-align: right;
    }
  `,
})
export class PlanCardComponent {
  readonly plan = input.required<Plan>();
  readonly showAction = input(true);

  protected validity(): string {
    const d = this.plan().validity_days;
    if (d === 365) return '1 year';
    if (d === 30 && this.plan().category !== 'prepaid') return 'month';
    return `${d} days`;
  }
}
