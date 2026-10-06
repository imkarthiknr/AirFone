import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export const digitsOnly = (v: string) => (v ?? '').replace(/[\s-]/g, '');

export function verhoeffValid(num: string): boolean {
  let c = 0;
  [...num].reverse().forEach((ch, i) => (c = D[c][P[i % 8][Number(ch)]]));
  return c === 0;
}

export function luhnValid(num: string): boolean {
  let sum = 0;
  [...num].reverse().forEach((ch, i) => {
    let d = Number(ch);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  });
  return sum % 10 === 0;
}

/** Aadhaar: 12 digits (spaces/dashes allowed), not starting with 0/1, Verhoeff checksum. */
export const aadhaarValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = digitsOnly(c.value);
  if (!v) return null;
  if (!/^[2-9]\d{11}$/.test(v)) return { aadhaarFormat: true };
  return verhoeffValid(v) ? null : { aadhaarChecksum: true };
};

export const cardNumberValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = digitsOnly(c.value);
  if (!v) return null;
  if (!/^\d{13,19}$/.test(v)) return { cardFormat: true };
  return luhnValid(v) ? null : { cardLuhn: true };
};

/** At least one letter and one digit. */
export const strongPassword: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = String(c.value ?? '');
  if (!v) return null;
  return /[A-Za-z]/.test(v) && /\d/.test(v) ? null : { weakPassword: true };
};

/** Must be at least `years` old. */
export function minAge(years: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    if (!c.value) return null;
    const dob = new Date(c.value);
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() - years);
    return dob <= limit ? null : { minAge: { years } };
  };
}

/** Card expiry (month/year controls in a group) must not be in the past. */
export const notExpired: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const m = Number(g.get('exp_month')?.value);
  const y = Number(g.get('exp_year')?.value);
  if (!m || !y) return null;
  const now = new Date();
  return y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1)
    ? null
    : { expired: true };
};

export function cardBrand(number: string): string {
  const n = digitsOnly(number);
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'American Express';
  if (/^(60|65|81|82|508)/.test(n)) return 'RuPay';
  return '';
}
