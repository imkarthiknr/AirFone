import { HttpErrorResponse } from '@angular/common/http';

interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/** A message that is safe to show users. */
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach AirFone right now. Check your connection.';
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return 'Please correct the highlighted fields.';
    if (err.status >= 500) return 'Something went wrong on our side. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

/** Per-field messages from either our `fields` object or FastAPI's 422 `detail` list. */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof HttpErrorResponse)) return {};
  const out: Record<string, string> = { ...(err.error?.fields ?? {}) };
  const detail = err.error?.detail;
  if (Array.isArray(detail)) {
    for (const issue of detail as ValidationIssue[]) {
      const field = String(issue.loc[issue.loc.length - 1]);
      out[field] ??= tidy(issue.msg);
    }
  }
  return out;
}

function tidy(msg: string): string {
  const m = msg.replace(/^Value error, /, '');
  return m.charAt(0).toUpperCase() + m.slice(1) + (m.endsWith('.') ? '' : '.');
}
