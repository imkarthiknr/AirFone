import { Component, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

const MESSAGES: Record<string, (e: any) => string> = {
  required: () => 'This field is required.',
  email: () => 'Enter a valid email address.',
  minlength: (e) => `Must be at least ${e.requiredLength} characters.`,
  maxlength: (e) => `Must be at most ${e.requiredLength} characters.`,
  min: (e) => `Must be at least ${e.min}.`,
  max: (e) => `Must be at most ${e.max}.`,
  weakPassword: () => 'Use at least one letter and one number.',
  aadhaarFormat: () => 'Enter the 12-digit Aadhaar number (cannot start with 0 or 1).',
  aadhaarChecksum: () => "That isn't a valid Aadhaar number. Please check the digits.",
  cardFormat: () => 'Card numbers have 13 to 19 digits.',
  cardLuhn: () => 'That card number is not valid.',
  minAge: (e) => `You must be at least ${e.years} years old.`,
  mismatch: () => 'Passwords do not match.',
};

export function describeErrors(errors: ValidationErrors, patternMessage: string): string {
  const [key, value] = Object.entries(errors)[0];
  if (key === 'server') return String(value);
  if (key === 'pattern') return patternMessage;
  return MESSAGES[key]?.(value) ?? 'This value is not valid.';
}

/**
 * Shows the first validation error of a control once it has been touched.
 * Server-side messages are attached to the control as a `server` error by the page.
 */
@Component({
  selector: 'app-field-error',
  template: `@if (message; as m) {
    <p class="field-error" [attr.id]="id()" role="alert">{{ m }}</p>
  }`,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl>();
  readonly patternMessage = input('Please use the expected format.');
  readonly id = input<string | null>(null);

  protected get message(): string | null {
    const c = this.control();
    if (!c.errors || !(c.touched || c.dirty)) return null;
    return describeErrors(c.errors, this.patternMessage());
  }
}

/** Copy `{field: message}` from an API error onto the matching form controls. */
export function applyServerErrors(
  form: { get(path: string): AbstractControl | null },
  fields: Record<string, string>,
): void {
  for (const [name, message] of Object.entries(fields)) {
    const control = form.get(name);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), server: message });
      control.markAsTouched();
    }
  }
}
