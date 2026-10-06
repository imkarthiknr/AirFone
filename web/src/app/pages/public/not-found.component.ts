import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="container page">
      <div class="card narrow center">
        <p class="code">404</p>
        <h1>Oops! Page not found</h1>
        <p class="muted">The page you requested doesn't exist or has moved.</p>
        <div class="actions center-row">
          <a routerLink="/" class="btn">Visit home page</a>
          <a routerLink="/help/support" class="btn ghost">Contact support</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .center {
      text-align: center;
    }
    .code {
      font-size: 4rem;
      font-weight: 900;
      margin: 0;
      background: var(--hero);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .center-row {
      justify-content: center;
    }
  `,
})
export class NotFoundComponent {}
