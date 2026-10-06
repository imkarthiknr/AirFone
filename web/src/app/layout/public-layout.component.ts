import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { LogoComponent } from '../shared/logo.component';

/** Header + footer for public and customer pages. */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container bar">
        <a routerLink="/" class="brand" aria-label="AirFone home"><app-logo /></a>
        <button
          type="button"
          class="menu-toggle btn ghost small"
          (click)="open.set(!open())"
          [attr.aria-expanded]="open()"
          aria-controls="main-nav"
        >
          Menu
        </button>
        <nav id="main-nav" [class.open]="open()" (click)="open.set(false)" aria-label="Main">
          @if (auth.isCustomer()) {
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/plans" routerLinkActive="active">Plans</a>
            <a routerLink="/history" routerLinkActive="active">Bills</a>
            <a routerLink="/help" routerLinkActive="active">Help</a>
            <a routerLink="/profile" routerLinkActive="active">Profile</a>
            <button type="button" class="btn ghost small" (click)="auth.logout()">Log out</button>
          } @else {
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
              >Home</a
            >
            <a routerLink="/plans" routerLinkActive="active">Plans</a>
            <a routerLink="/help" routerLinkActive="active">Help</a>
            <a routerLink="/admin/login">Admin</a>
            <a routerLink="/login" class="btn ghost small">Log in</a>
            <a routerLink="/register" class="btn small">Get a connection</a>
          }
        </nav>
      </div>
    </header>
    <main id="main" tabindex="-1"><router-outlet /></main>
    <footer class="site-footer">
      <div class="container foot">
        <div>
          <app-logo [size]="26" />
          <p class="muted small">
            Connecting people since 2010. A portfolio rebuild of a 2020 team project.
          </p>
        </div>
        <nav aria-label="Footer">
          <a routerLink="/plans/prepaid">Prepaid</a>
          <a routerLink="/plans/postpaid">Postpaid</a>
          <a routerLink="/plans/broadband">Broadband</a>
          <a routerLink="/help">FAQs</a>
          <a routerLink="/help/support">Support</a>
          <a routerLink="/feedback">Feedback</a>
        </nav>
        <p class="muted small">© AirFone Telecom (fictional) · support&#64;airfone.example</p>
      </div>
    </footer>
  `,
  styles: `
    .skip {
      position: absolute;
      left: -999px;
      top: 0.5rem;
      z-index: 10;
    }
    .skip:focus {
      left: 0.5rem;
      background: var(--surface);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
    }
    .site-header {
      position: sticky;
      top: 0;
      z-index: 5;
      background: color-mix(in srgb, var(--surface) 92%, transparent);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 4rem;
    }
    .brand {
      text-decoration: none;
    }
    nav {
      display: flex;
      align-items: center;
      gap: 1.1rem;
    }
    nav a:not(.btn) {
      color: var(--text);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.3rem 0;
      border-bottom: 2px solid transparent;
    }
    nav a.active:not(.btn) {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    .menu-toggle {
      display: none;
    }
    main:focus {
      outline: none;
    }
    .site-footer {
      border-top: 1px solid var(--border);
      background: var(--surface);
      margin-top: 2rem;
    }
    .foot {
      display: grid;
      grid-template-columns: 1.4fr 2fr 1.2fr;
      gap: 1.5rem;
      align-items: start;
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
    .foot nav {
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
    }
    .foot nav a {
      font-weight: 500;
    }
    .foot p {
      margin-top: 0.5rem;
    }
    @media (max-width: 860px) {
      .menu-toggle {
        display: inline-flex;
      }
      .bar nav {
        display: none;
        position: absolute;
        top: 4rem;
        left: 0;
        right: 0;
        flex-direction: column;
        align-items: stretch;
        gap: 0.25rem;
        padding: 0.75rem 1rem 1rem;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
      }
      .bar nav.open {
        display: flex;
      }
      .foot {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PublicLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly open = signal(false);
}
