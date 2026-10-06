import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage, fieldErrors } from '../../core/http-error';
import { Customer, Notification } from '../../core/models';
import { AccountService } from '../../core/services/account.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldErrorComponent, applyServerErrors } from '../../shared/field-error.component';
import { strongPassword } from '../../shared/validators';
import { matchPassword } from '../public/reset-password.component';

/** Profile (the original cust-detail stub): details, edit, password and message inbox. */
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, FieldErrorComponent, DatePipe],
  template: `
    <div class="container page">
      <h1>My profile</h1>
      @if (customer(); as c) {
        <div class="layout">
          <section class="card">
            <h2>Account</h2>
            <dl>
              <div>
                <dt>Mobile number</dt>
                <dd class="mono">{{ c.mobile_no }}</dd>
              </div>
              <div>
                <dt>Connection</dt>
                <dd>
                  <span class="badge {{ c.connection_type }}">{{ c.connection_type }}</span>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{{ c.email }}</dd>
              </div>
              <div>
                <dt>Date of birth</dt>
                <dd>{{ c.dob | date: 'd MMM y' }}</dd>
              </div>
              <div>
                <dt>Aadhaar</dt>
                <dd class="mono">{{ c.aadhaar_masked }}</dd>
              </div>
              <div>
                <dt>Customer since</dt>
                <dd>{{ c.created_at | date: 'MMM y' }}</dd>
              </div>
            </dl>
          </section>

          <form class="card" [formGroup]="profile" (ngSubmit)="saveProfile()" novalidate>
            <h2>Personal details</h2>
            <div class="grid-2">
              @for (f of profileFields; track f.name) {
                <div class="field">
                  <label [for]="f.name">{{ f.label }}</label>
                  <input [id]="f.name" [formControlName]="f.name" [attr.autocomplete]="f.auto" />
                  <app-field-error
                    [control]="profile.get(f.name)!"
                    patternMessage="Enter a 6-digit PIN code."
                  />
                </div>
              }
            </div>
            <button type="submit" class="btn" [disabled]="savingProfile() || profile.pristine">
              Save changes
            </button>
          </form>

          <form class="card" [formGroup]="password" (ngSubmit)="changePassword()" novalidate>
            <h2>Change password</h2>
            <div class="field">
              <label for="current_password">Current password</label>
              <input
                id="current_password"
                type="password"
                formControlName="current_password"
                autocomplete="current-password"
              />
              <app-field-error [control]="password.controls.current_password" />
            </div>
            <div class="field">
              <label for="new_password">New password</label>
              <input
                id="new_password"
                type="password"
                formControlName="password"
                autocomplete="new-password"
              />
              <app-field-error [control]="password.controls.password" />
            </div>
            <div class="field">
              <label for="confirm">Confirm new password</label>
              <input
                id="confirm"
                type="password"
                formControlName="confirm"
                autocomplete="new-password"
              />
              <app-field-error [control]="password.controls.confirm" />
            </div>
            <button type="submit" class="btn" [disabled]="savingPassword()">Update password</button>
          </form>

          <section class="card inbox">
            <h2>Messages</h2>
            <p class="muted small">E-mails and SMS we've sent you.</p>
            @if (!messages().length) {
              <p class="empty">No messages yet.</p>
            }
            <ul>
              @for (m of messages(); track m.id) {
                <li>
                  <details>
                    <summary>
                      <span class="badge">{{ m.channel }}</span> {{ m.subject }}
                      <span class="muted small">· {{ m.created_at | date: 'd MMM, h:mm a' }}</span>
                    </summary>
                    <pre>{{ m.body }}</pre>
                  </details>
                </li>
              }
            </ul>
          </section>
        </div>
      } @else if (error(); as e) {
        <p class="alert error">{{ e }}</p>
      } @else {
        <p class="muted">Loading…</p>
      }
    </div>
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
      align-items: start;
    }
    dl {
      display: grid;
      gap: 0.6rem;
      margin: 0;
    }
    dl div {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
      font-weight: 600;
      text-align: right;
      overflow-wrap: anywhere;
    }
    .inbox ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.5rem;
      max-height: 26rem;
      overflow: auto;
    }
    .inbox summary {
      cursor: pointer;
    }
    pre {
      white-space: pre-wrap;
      font: inherit;
      font-size: 0.9rem;
      margin: 0.5rem 0 0;
      padding: 0.75rem;
      background: var(--surface-2);
      border-radius: 8px;
    }
    @media (max-width: 860px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ProfileComponent {
  private readonly account = inject(AccountService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly customer = signal<Customer | null>(null);
  protected readonly messages = signal<Notification[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);

  protected readonly profileFields = [
    { name: 'name', label: 'Full name', auto: 'name' },
    { name: 'occupation', label: 'Occupation', auto: 'organization-title' },
    { name: 'house_no', label: 'House number', auto: 'off' },
    { name: 'street', label: 'Street', auto: 'address-line1' },
    { name: 'city', label: 'City', auto: 'address-level2' },
    { name: 'state', label: 'State', auto: 'address-level1' },
    { name: 'pincode', label: 'PIN code', auto: 'postal-code' },
  ];
  protected readonly profile = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    occupation: ['', [Validators.required, Validators.minLength(2)]],
    house_no: ['', Validators.required],
    street: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['', [Validators.required, Validators.minLength(2)]],
    pincode: ['', [Validators.required, Validators.pattern(/^[1-9]\d{5}$/)]],
  });
  protected readonly password = this.fb.group(
    {
      current_password: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), strongPassword]],
      confirm: ['', Validators.required],
    },
    { validators: matchPassword },
  );

  ngOnInit(): void {
    this.account.summary().subscribe({
      next: (s) => this.setCustomer(s.customer),
      error: (err) => this.error.set(errorMessage(err)),
    });
    this.account.notifications().subscribe({ next: (m) => this.messages.set(m) });
  }

  private setCustomer(c: Customer): void {
    this.customer.set(c);
    this.profile.reset({
      name: c.name,
      occupation: c.occupation,
      house_no: c.house_no,
      street: c.street,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
    });
  }

  protected saveProfile(): void {
    if (this.profile.invalid) {
      this.profile.markAllAsTouched();
      return;
    }
    this.savingProfile.set(true);
    this.account.updateProfile(this.profile.getRawValue()).subscribe({
      next: (c) => {
        this.savingProfile.set(false);
        this.setCustomer(c);
        this.toast.show('Profile updated.');
      },
      error: (err) => {
        this.savingProfile.set(false);
        applyServerErrors(this.profile, fieldErrors(err));
        this.toast.show(errorMessage(err), 'error');
      },
    });
  }

  protected changePassword(): void {
    if (this.password.invalid) {
      this.password.markAllAsTouched();
      return;
    }
    const v = this.password.getRawValue();
    this.savingPassword.set(true);
    this.account.changePassword(v.current_password, v.password).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.password.reset();
        this.toast.show('Password changed.');
      },
      error: (err) => {
        this.savingPassword.set(false);
        applyServerErrors(this.password, fieldErrors(err));
      },
    });
  }
}
