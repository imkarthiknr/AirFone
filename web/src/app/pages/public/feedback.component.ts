import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http-error';
import { Satisfaction } from '../../core/models';
import { AccountService } from '../../core/services/account.service';
import { FieldErrorComponent } from '../../shared/field-error.component';

/** The original Feedback page, which now actually saves the feedback. */
@Component({
  selector: 'app-feedback',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="container page">
      <form class="card medium" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Give us your valuable feedback</h1>
        @if (done()) {
          <p class="alert success" role="status">Thank you! Your feedback helps us improve.</p>
          <a routerLink="/" class="btn">Back to home</a>
        } @else {
          <div class="grid-2">
            <div class="field">
              <label for="name">Name</label>
              <input id="name" formControlName="name" autocomplete="name" />
              <app-field-error [control]="form.controls.name" />
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" formControlName="email" autocomplete="email" />
              <app-field-error [control]="form.controls.email" />
            </div>
          </div>
          <fieldset>
            <legend>How satisfied were you with our service?</legend>
            <div class="ratings">
              @for (r of ratings; track r.value) {
                <label
                  class="rating"
                  [class.selected]="form.controls.satisfaction.value === r.value"
                >
                  <input type="radio" formControlName="satisfaction" [value]="r.value" />
                  <span aria-hidden="true">{{ r.emoji }}</span> {{ r.label }}
                </label>
              }
            </div>
            <app-field-error [control]="form.controls.satisfaction" />
          </fieldset>
          <div class="field">
            <label for="comments">Other comments or suggestions</label>
            <textarea id="comments" formControlName="comments" rows="4"></textarea>
          </div>
          @if (error(); as e) {
            <p class="alert error" role="alert">{{ e }}</p>
          }
          <button type="submit" class="btn" [disabled]="busy()">Send feedback</button>
        }
      </form>
    </div>
  `,
  styles: `
    .ratings {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.6rem;
    }
    .rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
    }
    .rating input {
      position: absolute;
      opacity: 0;
      width: 1px;
    }
    .rating span {
      font-size: 1.6rem;
    }
    .rating.selected {
      border-color: var(--primary);
      background: var(--primary-soft);
    }
    .rating:focus-within {
      outline: 3px solid color-mix(in srgb, var(--primary) 45%, transparent);
    }
    @media (max-width: 560px) {
      .ratings {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `,
})
export class FeedbackComponent {
  private readonly account = inject(AccountService);
  protected readonly busy = signal(false);
  protected readonly done = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ratings: { value: Satisfaction; label: string; emoji: string }[] = [
    { value: 'excellent', label: 'Excellent', emoji: '🤩' },
    { value: 'good', label: 'Good', emoji: '😀' },
    { value: 'average', label: 'Average', emoji: '😐' },
    { value: 'bad', label: 'Bad', emoji: '☹️' },
  ];
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    satisfaction: ['' as Satisfaction | '', Validators.required],
    comments: ['', Validators.maxLength(2000)],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.busy.set(true);
    this.account.feedback({ ...v, satisfaction: v.satisfaction as Satisfaction }).subscribe({
      next: () => this.done.set(true),
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
