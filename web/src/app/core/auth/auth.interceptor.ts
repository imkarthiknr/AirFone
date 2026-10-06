import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api';
import { AuthService } from './auth.service';

/** Adds the bearer token to API calls and signs out when the API says the token is dead. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const api = inject(API_URL);
  if (!req.url.startsWith(api)) return next(req);

  const token = auth.token();
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authed).pipe(
    catchError((err: unknown) => {
      const isLogin = req.url.includes('/auth/');
      if (err instanceof HttpErrorResponse && err.status === 401 && token && !isLogin) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
