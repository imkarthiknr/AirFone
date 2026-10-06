import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../api';
import { Role } from '../models';

interface Session {
  token: string;
  role: Role;
  /** Display name: customer mobile number or admin username. */
  label: string;
}

interface TokenResponse {
  access_token: string;
  role: Role;
}

const STORAGE_KEY = 'airfone.session';

function load(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

/**
 * Holds the signed-in session (customer OR admin) in a signal.
 * Persisted to sessionStorage so a reload keeps you signed in for the tab's lifetime.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = inject(API_URL);
  private readonly session = signal<Session | null>(load());

  readonly token = computed(() => this.session()?.token ?? null);
  readonly role = computed(() => this.session()?.role ?? null);
  readonly label = computed(() => this.session()?.label ?? '');
  readonly isCustomer = computed(() => this.role() === 'customer');
  readonly isAdmin = computed(() => this.role() === 'admin');

  login(mobileNo: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.api}/auth/login`, { mobile_no: mobileNo, password })
      .pipe(tap((r) => this.set({ token: r.access_token, role: 'customer', label: mobileNo })));
  }

  adminLogin(username: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.api}/auth/admin/login`, { username, password })
      .pipe(tap((r) => this.set({ token: r.access_token, role: 'admin', label: username })));
  }

  setLabel(label: string): void {
    const s = this.session();
    if (s) this.set({ ...s, label });
  }

  logout(redirect = true): void {
    const wasAdmin = this.isAdmin();
    this.set(null);
    if (redirect) this.router.navigateByUrl(wasAdmin ? '/admin/login' : '/login');
  }

  private set(session: Session | null): void {
    this.session.set(session);
    try {
      if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable: keep the in-memory session */
    }
  }
}
