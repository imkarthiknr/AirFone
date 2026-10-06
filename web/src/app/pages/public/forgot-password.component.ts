import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http-error';
import { AccountService } from '../../core/services/account.service';
import { FieldErrorComponent } from '../../shared/field-error.component';

/** Request a reset link. (The original e-mailed the password itself.) */
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="container page">
      <form class="card narrow" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Forgot password?</h1>
        @if (sent()) {
          <p class="alert success" role="status">
            If {{ form.controls.email.value }} is registered, a reset link is on its way. It expires
            in 30 minutes.
          </p>
          <a routerLink="/login" class="btn block">Back to log in</a>
        } @else {
          <p class="muted">Enter the e-mail you registered with and we'll send you a reset link.</p>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" />
            <app-field-error [control]="form.controls.email" />
          </div>
          @if (error(); as e) {
            <p class="alert error" role="alert">{{ e }}</p>
          }
          <button type="submit" class="btn block" [disabled]="busy()">Send reset link</button>
          <p class="small"><a routerLink="/login">Back to log in</a></p>
        }
      </form>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly account = inject(AccountService);
  protected readonly busy = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.account.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => this.sent.set(true),
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
