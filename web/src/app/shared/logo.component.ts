import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="url(#af-g)" />
      <path
        d="M9 21.5a10 10 0 0 1 14 0M11.8 18.5a6 6 0 0 1 8.4 0"
        fill="none"
        stroke="#fff"
        stroke-width="2.4"
        stroke-linecap="round"
      />
      <circle cx="16" cy="23.5" r="2" fill="#fff" />
      <path
        d="M12 12.5a8 8 0 0 1 8 0"
        fill="none"
        stroke="#fff"
        stroke-width="2.4"
        stroke-linecap="round"
        opacity=".55"
      />
      <defs>
        <linearGradient id="af-g" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stop-color="#0044ad" />
          <stop offset="1" stop-color="#00a99d" />
        </linearGradient>
      </defs>
    </svg>
    <span class="word">Air<b>Fone</b></span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .word {
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text);
    }
    .word b {
      font-weight: 800;
      color: var(--primary);
    }
  `,
})
export class LogoComponent {
  readonly size = input(32);
}
