import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Customer-only pages. Remembers where you were going. */
export const customerGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isCustomer()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Admin-only pages. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAdmin()) return true;
  return inject(Router).createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};

/** Login/register pages: send signed-in users to their home instead. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isCustomer()) return inject(Router).createUrlTree(['/dashboard']);
  if (auth.isAdmin()) return inject(Router).createUrlTree(['/admin']);
  return true;
};

/** Only follow local return URLs (prevents open redirects). */
export function safeReturnUrl(url: string | null | undefined, fallback: string): string {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : fallback;
}
