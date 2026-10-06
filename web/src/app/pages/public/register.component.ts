import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage, fieldErrors } from '../../core/http-error';
import { Customer, PLAN_CATEGORIES } from '../../core/models';
import { AccountService } from '../../core/services/account.service';
import { FieldErrorComponent, applyServerErrors } from '../../shared/field-error.component';
import { aadhaarValidator, digitsOnly, minAge, strongPassword } from '../../shared/validators';

/** New connection. The API allocates a mobile number, shown here and e-mailed. */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="container page">
      @if (created(); as c) {
        <section class="card medium success" aria-live="polite">
          <h1>Welcome to AirFone, {{ c.name }}!</h1>
          <p>Your new {{ c.connection_type }} number is</p>
          <p class="number mono" data-testid="new-number">{{ c.mobile_no }}</p>
          <p class="muted">
            We've also e-mailed it to {{ c.email }}. Log in with this number to recharge.
          </p>
          <div class="actions">
            <a class="btn" routerLink="/login" [queryParams]="{ mobile: c.mobile_no }"
              >Log in now</a
            >
            <a class="btn secondary" [routerLink]="['/plans', c.connection_type]"
              >Browse {{ c.connection_type }} plans</a
            >
          </div>
        </section>
      } @else {
        <form class="card medium" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <h1>Get a new connection</h1>
          <p class="muted">We'll allocate your mobile number as soon as you register.</p>

          <fieldset>
            <legend>Connection</legend>
            <div class="types" role="radiogroup" aria-label="Connection type">
              @for (t of types; track t) {
                <label class="type" [class.selected]="form.controls.connection_type.value === t">
                  <input type="radio" formControlName="connection_type" [value]="t" />
                  <span>{{ t }}</span>
                </label>
              }
            </div>
            <app-field-error [control]="form.controls.connection_type" />
          </fieldset>

          <fieldset>
            <legend>About you</legend>
            <div class="grid-2">
              <div class="field">
                <label for="name">Full name</label>
                <input
                  id="name"
                  formControlName="name"
                  autocomplete="name"
                  [attr.aria-invalid]="bad('name')"
                />
                <app-field-error [control]="form.controls.name" />
              </div>
              <div class="field">
                <label for="dob">Date of birth</label>
                <input
                  id="dob"
                  type="date"
                  formControlName="dob"
                  [attr.aria-invalid]="bad('dob')"
                />
                <app-field-error [control]="form.controls.dob" />
              </div>
              <div class="field">
                <label for="email">Email</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  [attr.aria-invalid]="bad('email')"
                />
                <app-field-error [control]="form.controls.email" />
              </div>
              <div class="field">
                <label for="occupation">Occupation</label>
                <input
                  id="occupation"
                  formControlName="occupation"
                  [attr.aria-invalid]="bad('occupation')"
                />
                <app-field-error [control]="form.controls.occupation" />
              </div>
              <div class="field">
                <label for="aadhaar">Aadhaar number</label>
                <input
                  id="aadhaar"
                  formControlName="aadhaar"
                  inputmode="numeric"
                  placeholder="2345 6789 0124"
                  autocomplete="off"
                  aria-describedby="aadhaar-hint"
                  [attr.aria-invalid]="bad('aadhaar')"
                />
                <span class="hint" id="aadhaar-hint"
                  >Checked for validity; only the last 4 digits are stored.</span
                >
                <app-field-error [control]="form.controls.aadhaar" />
              </div>
              <div class="field">
                <label for="password">Password</label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  autocomplete="new-password"
                  [attr.aria-invalid]="bad('password')"
                />
                <app-field-error [control]="form.controls.password" />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Address</legend>
            <div class="grid-2">
              <div class="field">
                <label for="house_no">House number</label>
                <input
                  id="house_no"
                  formControlName="house_no"
                  [attr.aria-invalid]="bad('house_no')"
                />
                <app-field-error [control]="form.controls.house_no" />
              </div>
              <div class="field">
                <label for="street">Street</label>
                <input
                  id="street"
                  formControlName="street"
                  autocomplete="address-line1"
                  [attr.aria-invalid]="bad('street')"
                />
                <app-field-error [control]="form.controls.street" />
              </div>
              <div class="field">
                <label for="city">City</label>
                <input
                  id="city"
                  formControlName="city"
                  autocomplete="address-level2"
                  [attr.aria-invalid]="bad('city')"
                />
                <app-field-error [control]="form.controls.city" />
              </div>
              <div class="field">
                <label for="state">State</label>
                <input
                  id="state"
                  formControlName="state"
                  autocomplete="address-level1"
                  [attr.aria-invalid]="bad('state')"
                />
                <app-field-error [control]="form.controls.state" />
              </div>
              <div class="field">
                <label for="pincode">PIN code</label>
                <input
                  id="pincode"
                  formControlName="pincode"
                  inputmode="numeric"
                  autocomplete="postal-code"
                  [attr.aria-invalid]="bad('pincode')"
                />
                <app-field-error
                  [control]="form.controls.pincode"
                  patternMessage="Enter a 6-digit PIN code."
                />
              </div>
            </div>
          </fieldset>

          @if (error(); as e) {
            <p class="alert error" role="alert">{{ e }}</p>
          }
          <div class="actions">
            <button type="submit" class="btn" [disabled]="saving()">
              {{ saving() ? 'Registering…' : 'Register' }}
            </button>
            <a routerLink="/login" class="btn ghost">I already have a number</a>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    .types {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
    .type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      text-transform: capitalize;
      font-weight: 600;
    }
    .type input {
      width: auto;
    }
    .type.selected {
      border-color: var(--primary);
      background: var(--primary-soft);
      color: var(--primary);
    }
    .success {
      text-align: center;
    }
    .number {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--primary);
      margin: 0.25rem 0 0.75rem;
    }
    .success .actions {
      justify-content: center;
    }
  `,
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly account = inject(AccountService);

  protected readonly types = PLAN_CATEGORIES;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly created = signal<Customer | null>(null);

  protected readonly form = this.fb.group({
    connection_type: ['prepaid', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    dob: ['', [Validators.required, minAge(18)]],
    email: ['', [Validators.required, Validators.email]],
    occupation: ['', [Validators.required, Validators.minLength(2)]],
    aadhaar: ['', [Validators.required, aadhaarValidator]],
    password: ['', [Validators.required, Validators.minLength(8), strongPassword]],
    house_no: ['', Validators.required],
    street: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['', [Validators.required, Validators.minLength(2)]],
    pincode: ['', [Validators.required, Validators.pattern(/^[1-9]\d{5}$/)]],
  });

  protected bad(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please correct the highlighted fields.');
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.account
      .register({
        ...v,
        aadhaar: digitsOnly(v.aadhaar),
        connection_type: v.connection_type as Customer['connection_type'],
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.created.set(res.customer);
        },
        error: (err) => {
          this.saving.set(false);
          applyServerErrors(this.form, fieldErrors(err));
          this.error.set(errorMessage(err));
        },
      });
  }
}
