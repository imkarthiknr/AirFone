import { Routes } from '@angular/router';
import { adminGuard, customerGuard, guestGuard } from './core/auth/guards';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { PublicLayoutComponent } from './layout/public-layout.component';

/**
 * Route map (original 2020 route → new route):
 *   /                → /              Home
 *   /Plans[/Prepaid|/Postpaid|/Broadband] → /plans[/:category]
 *   /Register, /Login, /Login/ForgetPassword → /register, /login, /forgot-password (+ /reset-password)
 *   /Dashboard, /Bill + /Payment, /History → /dashboard, /recharge/:planId, /history
 *   /Help, /Help/Support, /Feedback → /help, /help/support, /feedback
 *   /AdminLogin, /AdminDashboard, /AdminCustomerDetails, /AdminCustomerUpdate/:mobileno,
 *   /AdminBill, /AdminComplaint, /AdminComplaintRespond/:id, /AdminProfile → /admin/…
 */
export const routes: Routes = [
  {
    path: 'admin/login',
    title: 'Admin login · AirFone',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/admin/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        title: 'Admin · AirFone',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'customers',
        title: 'Customers · AirFone admin',
        loadComponent: () =>
          import('./pages/admin/admin-customers.component').then((m) => m.AdminCustomersComponent),
      },
      {
        path: 'customers/:id',
        title: 'Customer · AirFone admin',
        loadComponent: () =>
          import('./pages/admin/admin-customer-detail.component').then(
            (m) => m.AdminCustomerDetailComponent,
          ),
      },
      {
        path: 'tickets',
        title: 'Complaints · AirFone admin',
        loadComponent: () =>
          import('./pages/admin/admin-tickets.component').then((m) => m.AdminTicketsComponent),
      },
      {
        path: 'tickets/:id',
        title: 'Respond · AirFone admin',
        loadComponent: () =>
          import('./pages/admin/admin-tickets.component').then(
            (m) => m.AdminTicketRespondComponent,
          ),
      },
      {
        path: 'billing',
        title: 'Bill generation · AirFone admin',
        loadComponent: () =>
          import('./pages/admin/admin-billing.component').then((m) => m.AdminBillingComponent),
      },
      {
        path: 'feedback',
        title: 'Feedback · AirFone admin',
        loadComponent: () =>
          import('./pages/admin/admin-feedback.component').then((m) => m.AdminFeedbackComponent),
      },
      {
        path: 'outbox',
        title: 'Outbox · AirFone admin',
        loadComponent: () =>
          import('./pages/admin/admin-feedback.component').then((m) => m.AdminOutboxComponent),
      },
      {
        path: 'profile',
        title: 'Profile · AirFone admin',
        loadComponent: () =>
          import('./pages/admin/admin-profile.component').then((m) => m.AdminProfileComponent),
      },
    ],
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        title: 'AirFone · Connecting people',
        loadComponent: () => import('./pages/public/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'plans',
        title: 'Plans · AirFone',
        loadComponent: () => import('./pages/public/plans.component').then((m) => m.PlansComponent),
      },
      {
        path: 'plans/:category',
        title: 'Plans · AirFone',
        loadComponent: () => import('./pages/public/plans.component').then((m) => m.PlansComponent),
      },
      {
        path: 'register',
        title: 'Get a connection · AirFone',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/public/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'login',
        title: 'Log in · AirFone',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/public/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'forgot-password',
        title: 'Forgot password · AirFone',
        loadComponent: () =>
          import('./pages/public/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'reset-password',
        title: 'Reset password · AirFone',
        loadComponent: () =>
          import('./pages/public/reset-password.component').then((m) => m.ResetPasswordComponent),
      },
      {
        path: 'help',
        title: 'Help · AirFone',
        loadComponent: () => import('./pages/public/help.component').then((m) => m.HelpComponent),
      },
      {
        path: 'help/support',
        title: 'Support · AirFone',
        loadComponent: () =>
          import('./pages/public/support.component').then((m) => m.SupportComponent),
      },
      {
        path: 'feedback',
        title: 'Feedback · AirFone',
        loadComponent: () =>
          import('./pages/public/feedback.component').then((m) => m.FeedbackComponent),
      },
      {
        path: 'dashboard',
        title: 'Dashboard · AirFone',
        canActivate: [customerGuard],
        loadComponent: () =>
          import('./pages/customer/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'recharge/success/:billId',
        title: 'Receipt · AirFone',
        canActivate: [customerGuard],
        loadComponent: () =>
          import('./pages/customer/receipt.component').then((m) => m.ReceiptComponent),
      },
      {
        path: 'recharge/:planId',
        title: 'Recharge · AirFone',
        canActivate: [customerGuard],
        loadComponent: () =>
          import('./pages/customer/recharge.component').then((m) => m.RechargeComponent),
      },
      {
        path: 'history',
        title: 'Bill history · AirFone',
        canActivate: [customerGuard],
        loadComponent: () =>
          import('./pages/customer/history.component').then((m) => m.HistoryComponent),
      },
      {
        path: 'profile',
        title: 'Profile · AirFone',
        canActivate: [customerGuard],
        loadComponent: () =>
          import('./pages/customer/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: '**',
        title: 'Not found · AirFone',
        loadComponent: () =>
          import('./pages/public/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
