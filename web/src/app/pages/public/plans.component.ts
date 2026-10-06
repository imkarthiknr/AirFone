import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { errorMessage } from '../../core/http-error';
import { PLAN_CATEGORIES, Plan, PlanCategory } from '../../core/models';
import { PlansService } from '../../core/services/plans.service';
import { PlanCardComponent } from '../../shared/plan-card.component';

type State = { plans: Plan[]; loading: boolean; error: string | null };

/** /plans and /plans/:category (the original Plans, Prepaid, Postpaid and Broadband pages). */
@Component({
  selector: 'app-plans',
  imports: [RouterLink, RouterLinkActive, PlanCardComponent, TitleCasePipe],
  template: `
    <div class="container page">
      <div class="page-head">
        <div>
          <h1>{{ title() }}</h1>
          <p class="muted">{{ subtitle() }}</p>
        </div>
      </div>
      <nav class="tabs" aria-label="Plan categories">
        <a routerLink="/plans" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
          >All</a
        >
        @for (c of categories; track c) {
          <a [routerLink]="['/plans', c]" routerLinkActive="active">{{ c | titlecase }}</a>
        }
      </nav>

      @if (auth.isCustomer()) {
        <p class="alert info small">
          You can recharge plans that match your connection type. Pick a plan to continue.
        </p>
      }
      @if (state().error; as e) {
        <p class="alert error">{{ e }}</p>
      } @else if (state().loading) {
        <p class="muted">Loading plans…</p>
      } @else {
        @for (group of groups(); track group.category) {
          <section class="group" [attr.aria-labelledby]="'h-' + group.category">
            @if (!category()) {
              <h2 [id]="'h-' + group.category">{{ group.category | titlecase }}</h2>
            }
            <div class="grid-3">
              @for (p of group.plans; track p.id) {
                <app-plan-card [plan]="p" />
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: `
    .group {
      margin-bottom: 2.25rem;
    }
    .group h2 {
      margin-bottom: 0.9rem;
    }
  `,
})
export class PlansComponent {
  protected readonly auth = inject(AuthService);
  /** Route param (component input binding); undefined on /plans. */
  readonly category = input<PlanCategory | undefined>(undefined);
  protected readonly categories = PLAN_CATEGORIES;

  protected readonly state = toSignal(
    inject(PlansService)
      .all()
      .pipe(
        map((plans): State => ({ plans, loading: false, error: null })),
        startWith<State>({ plans: [], loading: true, error: null }),
        catchError((err) => of<State>({ plans: [], loading: false, error: errorMessage(err) })),
      ),
    { requireSync: true },
  );

  protected readonly groups = computed(() => {
    const cats = this.category() ? [this.category()!] : this.categories;
    return cats.map((c) => ({
      category: c,
      plans: this.state().plans.filter((p) => p.category === c),
    }));
  });

  protected readonly title = computed(() => {
    switch (this.category()) {
      case 'prepaid':
        return 'Prepaid plans';
      case 'postpaid':
        return 'Postpaid plans';
      case 'broadband':
        return 'Broadband plans';
      default:
        return 'All plans';
    }
  });

  protected readonly subtitle = computed(() => {
    switch (this.category()) {
      case 'prepaid':
        return 'Unlimited calls with daily data. Recharge only when you need to.';
      case 'postpaid':
        return 'Monthly and annual plans billed to your number.';
      case 'broadband':
        return 'Fiber to your home with generous monthly data.';
      default:
        return 'Prepaid, postpaid and fiber broadband, all in one place.';
    }
  });
}
