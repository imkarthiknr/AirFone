import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { errorMessage, fieldErrors } from '../../core/http-error';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldErrorComponent, applyServerErrors } from '../../shared/field-error.component';
import { strongPassword } from '../../shared/validators';

/** The original "Admin Profile" page, which now requires the current password to make changes. */
@Component({
  selector: 'app-admin-profile',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  template: `
    <h1>Admin profile</h1>
    <form class="card narrow left" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <p class="muted small">Admin ID: {{ adminId() ?? '…' }}</p>
      <div class="field">
        <label for="username">Username</label>
        <input id="username" formControlName="username" autocomplete="username" />
        <app-field-error
          [control]="form.controls.username"
          patternMessage="Letters, numbers, dots, dashes and underscores only."
        />
      </div>
      <div class="field">
        <label for="new_password">New password <span class="muted">(optional)</span></label>
        <input
          id="new_password"
          type="password"
          formControlName="new_password"
          autocomplete="new-password"
        />
        <app-field-error [control]="form.controls.new_password" />
      </div>
      <div class="field">
        <label for="current_password">Current password</label>
        <input
          id="current_password"
          type="password"
          formControlName="current_password"
          autocomplete="current-password"
        />
        <app-field-error [control]="form.controls.current_password" />
      </div>
      @if (error(); as e) {
        <p class="alert error" role="alert">{{ e }}</p>
      }
      <button type="submit" class="btn" [disabled]="busy()">Update</button>
    </form>
  `,
  styles: `
    .left {
      margin: 0;
    }
  `,
})
export class AdminProfileComponent {
  private readonly admin = inject(AdminService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly adminId = signal<number | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    username: [
      '',
      [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z0-9_.-]+$/)],
    ],
    new_password: ['', [Validators.minLength(8), strongPassword]],
    current_password: ['', Validators.required],
  });

  ngOnInit(): void {
    this.admin.me().subscribe((a) => {
      this.adminId.set(a.id);
      this.form.controls.username.setValue(a.username);
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.busy.set(true);
    this.error.set(null);
    this.admin
      .updateMe({
        username: v.username,
        current_password: v.current_password,
        new_password: v.new_password || null,
      })
      .subscribe({
        next: (a) => {
          this.busy.set(false);
          this.auth.setLabel(a.username);
          this.form.patchValue({ current_password: '', new_password: '' });
          this.form.markAsUntouched();
          this.toast.show('Profile updated.');
        },
        error: (err) => {
          this.busy.set(false);
          applyServerErrors(this.form, fieldErrors(err));
          this.error.set(errorMessage(err));
        },
      });
  }
}
