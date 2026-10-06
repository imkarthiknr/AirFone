import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { LogoComponent } from '../shared/logo.component';

/** Sidebar layout for the admin console (the original admin-menu + admin-header). */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <div class="shell">
      <aside>
        <a routerLink="/admin" class="brand"
          ><app-logo [size]="28" /><span class="tag">Admin</span></a
        >
        <nav aria-label="Admin">
          <a
            routerLink="/admin"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >Dashboard</a
          >
          <a routerLink="/admin/customers" routerLinkActive="active">Customers</a>
          <a routerLink="/admin/tickets" routerLinkActive="active">Complaints</a>
          <a routerLink="/admin/billing" routerLinkActive="active">Bill generation</a>
          <a routerLink="/admin/feedback" routerLinkActive="active">Feedback</a>
          <a routerLink="/admin/outbox" routerLinkActive="active">Outbox</a>
          <a routerLink="/admin/profile" routerLinkActive="active">Profile</a>
        </nav>
        <div class="who">
          <span class="muted small"
            >Signed in as <b>{{ auth.label() }}</b></span
          >
          <button type="button" class="btn ghost small" (click)="auth.logout()">Log out</button>
        </div>
      </aside>
      <main id="main"><router-outlet /></main>
    </div>
  `,
  styles: `
    .shell {
      display: grid;
      grid-template-columns: 15rem 1fr;
      min-height: 100vh;
    }
    aside {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.25rem 1rem;
      background: var(--surface);
      border-right: 1px solid var(--border);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
    }
    .tag {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
    }
    nav {
      display: grid;
      gap: 0.2rem;
    }
    nav a {
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      color: var(--text);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.94rem;
    }
    nav a:hover {
      background: var(--surface-2);
    }
    nav a.active {
      background: var(--primary-soft);
      color: var(--primary);
    }
    .who {
      margin-top: auto;
      display: grid;
      gap: 0.5rem;
    }
    main {
      padding: 2rem clamp(1rem, 3vw, 2.5rem) 3rem;
      min-width: 0;
    }
    @media (max-width: 860px) {
      .shell {
        grid-template-columns: 1fr;
      }
      aside {
        position: static;
        height: auto;
      }
      nav {
        grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
      }
    }
  `,
})
export class AdminLayoutComponent {
  protected readonly auth = inject(AuthService);
}
