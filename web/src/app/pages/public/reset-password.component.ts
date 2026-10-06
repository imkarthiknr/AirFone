import { Component, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/http-error';
import { AccountService } from '../../core/services/account.service';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { strongPassword } from '../../shared/validators';

export function matchPassword(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirm');
  if (!confirm) return null;
  const mismatch = !!confirm.value && pw !== confirm.value;
  const others = { ...(confirm.errors ?? {}) };
  delete others['mismatch'];
  confirm.setErrors(
    mismatch ? { ...others, mismatch: true } : Object.keys(others).length ? others : null,
  );
  return null;
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="container page">
      <form class="card narrow" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Choose a new password</h1>
        @if (!token()) {
          <p class="alert error">This link is missing its token. Request a new one.</p>
          <a routerLink="/forgot-password" class="btn block">Request a new link</a>
        } @else if (done()) {
          <p class="alert success" role="status">Password updated. You can log in now.</p>
          <a routerLink="/login" class="btn block">Log in</a>
        } @else {
          <div class="field">
            <label for="password">New password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
            />
            <app-field-error [control]="form.controls.password" />
          </div>
          <div class="field">
            <label for="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              formControlName="confirm"
              autocomplete="new-password"
            />
            <app-field-error [control]="form.controls.confirm" />
          </div>
          @if (error(); as e) {
            <p class="alert error" role="alert">{{ e }}</p>
            <p class="small"><a routerLink="/forgot-password">Request a new link</a></p>
          }
          <button type="submit" class="btn block" [disabled]="busy()">Update password</button>
        }
      </form>
    </div>
  `,
})
export class ResetPasswordComponent {
  private readonly account = inject(AccountService);
  readonly token = input<string | undefined>(undefined);
  protected readonly busy = signal(false);
  protected readonly done = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      password: ['', [Validators.required, Validators.minLength(8), strongPassword]],
      confirm: ['', Validators.required],
    },
    { validators: matchPassword },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.account.resetPassword(this.token()!, this.form.getRawValue().password).subscribe({
      next: () => this.done.set(true),
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
