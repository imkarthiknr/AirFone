import { InjectionToken } from '@angular/core';

/** API base URL. `/api/v1` is proxied to the FastAPI service (dev server or nginx). */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => '/api/v1',
});
