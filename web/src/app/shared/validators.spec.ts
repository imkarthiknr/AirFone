import { FormControl, FormGroup } from '@angular/forms';
import {
  aadhaarValidator,
  cardBrand,
  cardNumberValidator,
  luhnValid,
  minAge,
  notExpired,
  strongPassword,
  verhoeffValid,
} from './validators';

describe('validators', () => {
  it('verhoeff + aadhaar', () => {
    expect(verhoeffValid('234567890124')).toBe(true);
    expect(aadhaarValidator(new FormControl('2345 6789 0124'))).toBeNull();
    expect(aadhaarValidator(new FormControl('2345 6789 0125'))).toEqual({ aadhaarChecksum: true });
    expect(aadhaarValidator(new FormControl('1234 5678 9012'))).toEqual({ aadhaarFormat: true });
    expect(aadhaarValidator(new FormControl(''))).toBeNull();
  });

  it('luhn + card number + brand', () => {
    expect(luhnValid('4242424242424242')).toBe(true);
    expect(cardNumberValidator(new FormControl('4242 4242 4242 4241'))).toEqual({ cardLuhn: true });
    expect(cardNumberValidator(new FormControl('1234'))).toEqual({ cardFormat: true });
    expect(cardBrand('5555 5555 5555 4444')).toBe('Mastercard');
    expect(cardBrand('3782 822463 10005')).toBe('American Express');
    expect(cardBrand('9999')).toBe('');
  });

  it('password strength and minimum age', () => {
    expect(strongPassword(new FormControl('abcdefgh'))).toEqual({ weakPassword: true });
    expect(strongPassword(new FormControl('abc12345'))).toBeNull();
    const young = new Date();
    young.setFullYear(young.getFullYear() - 17);
    expect(minAge(18)(new FormControl(young.toISOString().slice(0, 10)))).toEqual({
      minAge: { years: 18 },
    });
    expect(minAge(18)(new FormControl('1990-01-01'))).toBeNull();
  });

  it('card expiry', () => {
    const now = new Date();
    const group = (m: number, y: number) =>
      new FormGroup({ exp_month: new FormControl(m), exp_year: new FormControl(y) });
    expect(notExpired(group(now.getMonth() + 1, now.getFullYear()))).toBeNull();
    expect(notExpired(group(12, now.getFullYear() - 1))).toEqual({ expired: true });
  });
});
