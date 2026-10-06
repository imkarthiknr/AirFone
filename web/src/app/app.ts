import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    @if (toast.current(); as t) {
      <div class="toast {{ t.kind }}" role="status" aria-live="polite">
        <span>{{ t.text }}</span>
        <button type="button" class="link" aria-label="Dismiss" (click)="toast.dismiss()">✕</button>
      </div>
    }
  `,
  styles: `
    .toast {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 50;
      max-width: min(28rem, calc(100vw - 2rem));
      display: flex;
      gap: 1rem;
      align-items: start;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--success);
      box-shadow: var(--shadow);
    }
    .toast.error {
      border-color: var(--danger);
    }
    .toast.info {
      border-color: var(--primary);
    }
  `,
})
export class App {
  protected readonly toast = inject(ToastService);
}
