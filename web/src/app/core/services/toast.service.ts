import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

/** One auto-dismissing message at a time, rendered by the app shell. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<{ kind: ToastKind; text: string } | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  show(text: string, kind: ToastKind = 'success', ms = 4500): void {
    clearTimeout(this.timer);
    this.current.set({ kind, text });
    this.timer = setTimeout(() => this.current.set(null), ms);
  }

  dismiss(): void {
    clearTimeout(this.timer);
    this.current.set(null);
  }
}
