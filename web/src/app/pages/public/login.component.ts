import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { safeReturnUrl } from '../../core/auth/guards';
import { errorMessage } from '../../core/http-error';
import { FieldErrorComponent } from '../../shared/field-error.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="container page">
      <form class="card narrow" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Log in</h1>
        <p class="muted">Use your AirFone mobile number.</p>
        <div class="field">
          <label for="mobile">Mobile number</label>
          <input
            id="mobile"
            formControlName="mobile_no"
            inputmode="numeric"
            autocomplete="username"
            placeholder="10-digit number"
          />
          <app-field-error
            [control]="form.controls.mobile_no"
            patternMessage="Enter your 10-digit AirFone number."
          />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            autocomplete="current-password"
          />
          <app-field-error [control]="form.controls.password" />
        </div>
        <a routerLink="/forgot-password" class="small">Forgot password?</a>
        @if (error(); as e) {
          <p class="alert error" role="alert">{{ e }}</p>
        }
        <div class="actions">
          <button type="submit" class="btn block" [disabled]="busy()">
            {{ busy() ? 'Signing in…' : 'Log in' }}
          </button>
        </div>
        <p class="muted small center">
          New to AirFone? <a routerLink="/register">Get a connection</a>
        </p>
      </form>
    </div>
  `,
  styles: `
    .center {
      text-align: center;
      margin-top: 1rem;
    }
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  /** Query params bound via withComponentInputBinding. */
  readonly returnUrl = input<string | undefined>(undefined);
  readonly mobile = input<string | undefined>(undefined);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    mobile_no: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.mobile()) this.form.controls.mobile_no.setValue(this.mobile()!);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { mobile_no, password } = this.form.getRawValue();
    this.busy.set(true);
    this.error.set(null);
    this.auth.login(mobile_no, password).subscribe({
      next: () => this.router.navigateByUrl(safeReturnUrl(this.returnUrl(), '/dashboard')),
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
