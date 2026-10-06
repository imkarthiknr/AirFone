import { HttpErrorResponse } from '@angular/common/http';
import { errorMessage, fieldErrors } from './http-error';

describe('http-error', () => {
  it('uses the API detail, or friendly fallbacks', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 409, error: { detail: 'Taken.' } }))).toBe(
      'Taken.',
    );
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('Cannot reach');
    expect(errorMessage(new HttpErrorResponse({ status: 500, error: null }))).toContain('our side');
    expect(errorMessage(new Error('x'))).toContain('Something went wrong');
  });

  it('collects field errors from `fields` and FastAPI 422 details', () => {
    const err = new HttpErrorResponse({
      status: 422,
      error: {
        detail: [
          { loc: ['body', 'aadhaar'], msg: 'Value error, is not valid', type: 'value_error' },
        ],
        fields: { email: 'Already registered.' },
      },
    });
    expect(fieldErrors(err)).toEqual({ email: 'Already registered.', aadhaar: 'Is not valid.' });
    expect(errorMessage(err)).toBe('Please correct the highlighted fields.');
  });
});
