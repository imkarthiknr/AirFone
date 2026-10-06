import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { safeReturnUrl } from '../../core/auth/guards';
import { errorMessage } from '../../core/http-error';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, LogoComponent],
  template: `
    <div class="wrap">
      <form class="card narrow" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <a routerLink="/" class="brand"><app-logo /></a>
        <h1>Admin login</h1>
        <div class="field">
          <label for="username">Username</label>
          <input id="username" formControlName="username" autocomplete="username" />
          <app-field-error [control]="form.controls.username" />
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
        @if (error(); as e) {
          <p class="alert error" role="alert">{{ e }}</p>
        }
        <button type="submit" class="btn block" [disabled]="busy()">Log in</button>
        <p class="small"><a routerLink="/login">Customer login →</a></p>
      </form>
    </div>
  `,
  styles: `
    .wrap {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: var(--hero);
    }
    .card {
      width: 100%;
    }
    .brand {
      display: inline-block;
      margin-bottom: 1rem;
      text-decoration: none;
    }
  `,
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly returnUrl = input<string | undefined>(undefined);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.busy.set(true);
    this.error.set(null);
    this.auth.adminLogin(username, password).subscribe({
      next: () => this.router.navigateByUrl(safeReturnUrl(this.returnUrl(), '/admin')),
      error: (err) => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
