import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import {
  AdminStats,
  AdminTicket,
  Bill,
  BillingReport,
  Customer,
  Feedback,
  Notification,
  Page,
  PlanCategory,
} from '../models';

function params(values: Record<string, string | number | null | undefined>): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(values)) {
    if (v !== null && v !== undefined && v !== '') p = p.set(k, v);
  }
  return p;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  private readonly base = `${this.api}/admin`;

  me(): Observable<{ id: number; username: string }> {
    return this.http.get<{ id: number; username: string }>(`${this.base}/me`);
  }

  updateMe(data: {
    username: string;
    current_password: string;
    new_password: string | null;
  }): Observable<{ id: number; username: string }> {
    return this.http.put<{ id: number; username: string }>(`${this.base}/me`, data);
  }

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/stats`);
  }

  customers(q: string, type: PlanCategory | '', page: number): Observable<Page<Customer>> {
    return this.http.get<Page<Customer>>(`${this.base}/customers`, {
      params: params({ q, connection_type: type, page, size: 10 }),
    });
  }

  customer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/customers/${id}`);
  }

  customerBills(id: number): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.base}/customers/${id}/bills`);
  }

  updateCustomer(
    id: number,
    data: { name: string; connection_type: PlanCategory; is_active: boolean },
  ): Observable<Customer> {
    return this.http.put<Customer>(`${this.base}/customers/${id}`, data);
  }

  sendPasswordReset(id: number): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.base}/customers/${id}/password-reset`, {});
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/customers/${id}`);
  }

  tickets(status: 'open' | 'resolved' | '', page: number): Observable<Page<AdminTicket>> {
    return this.http.get<Page<AdminTicket>>(`${this.base}/tickets`, {
      params: params({ status, page, size: 10 }),
    });
  }

  ticket(id: number): Observable<AdminTicket> {
    return this.http.get<AdminTicket>(`${this.base}/tickets/${id}`);
  }

  respond(id: number, message: string): Observable<AdminTicket> {
    return this.http.post<AdminTicket>(`${this.base}/tickets/${id}/respond`, { message });
  }

  billingReport(
    start: string,
    end: string,
    category: PlanCategory | '',
  ): Observable<BillingReport> {
    return this.http.get<BillingReport>(`${this.base}/billing-report`, {
      params: params({ start, end, category }),
    });
  }

  billingReportCsv(start: string, end: string, category: PlanCategory | ''): Observable<Blob> {
    return this.http.get(`${this.base}/billing-report.csv`, {
      params: params({ start, end, category }),
      responseType: 'blob',
    });
  }

  feedback(page: number): Observable<Page<Feedback>> {
    return this.http.get<Page<Feedback>>(`${this.base}/feedback`, { params: params({ page }) });
  }

  notifications(page: number): Observable<Page<Notification>> {
    return this.http.get<Page<Notification>>(`${this.base}/notifications`, {
      params: params({ page }),
    });
  }
}
