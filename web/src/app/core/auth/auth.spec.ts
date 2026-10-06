import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { adminGuard, customerGuard, guestGuard, safeReturnUrl } from './guards';

describe('auth', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const loginCustomer = () => {
    auth.login('9000000001', 'pw').subscribe();
    http.expectOne('/api/v1/auth/login').flush({ access_token: 'tok', role: 'customer' });
  };

  it('stores the session and attaches the bearer token to API calls only', () => {
    loginCustomer();
    expect(auth.isCustomer()).toBe(true);
    expect(JSON.parse(sessionStorage.getItem('airfone.session')!).label).toBe('9000000001');

    const client = TestBed.inject(HttpClient);
    client.get('/api/v1/me').subscribe();
    expect(http.expectOne('/api/v1/me').request.headers.get('Authorization')).toBe('Bearer tok');
    client.get('https://example.com/x').subscribe();
    expect(http.expectOne('https://example.com/x').request.headers.has('Authorization')).toBe(
      false,
    );
  });

  it('logs out when an authenticated call returns 401', () => {
    loginCustomer();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    TestBed.inject(HttpClient)
      .get('/api/v1/me')
      .subscribe({ error: () => undefined });
    http.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.role()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('guards route by role', () => {
    const run = (guard: typeof customerGuard) =>
      TestBed.runInInjectionContext(() => guard({} as never, { url: '/history' } as never));
    expect(String(run(customerGuard))).toBe('/login?returnUrl=%2Fhistory');
    expect(String(run(adminGuard))).toBe('/admin/login?returnUrl=%2Fhistory');
    expect(run(guestGuard)).toBe(true);

    auth.adminLogin('admin', 'pw').subscribe();
    http.expectOne('/api/v1/auth/admin/login').flush({ access_token: 't', role: 'admin' });
    expect(run(adminGuard)).toBe(true);
    expect(String(run(customerGuard))).toContain('/login');
    expect(String(run(guestGuard))).toBe('/admin');
  });

  it('only follows local return URLs', () => {
    expect(safeReturnUrl('/history', '/')).toBe('/history');
    expect(safeReturnUrl('//evil.example', '/')).toBe('/');
    expect(safeReturnUrl('https://evil.example', '/')).toBe('/');
    expect(safeReturnUrl(undefined, '/dashboard')).toBe('/dashboard');
  });
});
