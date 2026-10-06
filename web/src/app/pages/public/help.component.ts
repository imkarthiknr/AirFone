import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** FAQs (the original Help page), with a route into Support. */
@Component({
  selector: 'app-help',
  imports: [RouterLink],
  template: `
    <div class="container page">
      <div class="page-head">
        <div>
          <h1>Help &amp; FAQs</h1>
          <p class="muted">Quick answers to common questions.</p>
        </div>
        <a routerLink="/help/support" class="btn">Raise a complaint</a>
      </div>
      <div class="faq stack">
        @for (f of faqs; track f.q) {
          <details class="card">
            <summary>{{ f.q }}</summary>
            @for (a of f.a; track a) {
              <p>{{ a }}</p>
            }
          </details>
        }
      </div>
      <p class="muted">
        Still stuck? <a routerLink="/help/support">Raise a complaint</a> and we'll assign it to an
        agent, or <a routerLink="/feedback">tell us how we're doing</a>.
      </p>
    </div>
  `,
  styles: `
    .faq {
      margin-bottom: 1.5rem;
    }
    details {
      padding: 1rem 1.25rem;
    }
    summary {
      cursor: pointer;
      font-weight: 700;
    }
    details p {
      margin: 0.75rem 0 0;
      color: var(--muted);
    }
  `,
})
export class HelpComponent {
  protected readonly faqs = [
    {
      q: "I can't connect to mobile internet. What should I do?",
      a: [
        'Reset your mobile network settings (Settings → Network → Reset) and restart the phone. If it persists, raise a complaint and include your area.',
      ],
    },
    {
      q: "I recharged but can't see it. What should I do?",
      a: [
        'Recharges show up in Bills instantly. Confirmation e-mails and SMS can take a few minutes. If a payment went through but no bill appears, raise a complaint with the payment reference.',
      ],
    },
    {
      q: 'How do I see where my data went?',
      a: ['On your phone, open Settings → Cellular/Mobile data usage for a per-app breakdown.'],
    },
    {
      q: "What are the benefits of AirFone's internet service?",
      a: [
        'Consistent high speeds, so apps and pages load without waiting.',
        'Fast uploads and downloads for photos and videos.',
      ],
    },
    {
      q: 'Can I switch between prepaid, postpaid and broadband?',
      a: [
        'Plans must match your connection type. To switch, raise a complaint asking for a connection change and an agent will update your account.',
      ],
    },
    {
      q: 'I forgot my password.',
      a: [
        'Use "Forgot password?" on the log-in page. We e-mail a one-time link that expires in 30 minutes.',
      ],
    },
  ];
}
