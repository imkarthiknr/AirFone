import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import {
  AccountSummary,
  Bill,
  CardDetails,
  Customer,
  Notification,
  RegisterRequest,
  Satisfaction,
  Ticket,
} from '../models';

export interface ProfileUpdate {
  name: string;
  occupation: string;
  house_no: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

/** Everything a customer (or visitor) does with their own account. */
@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);

  register(data: RegisterRequest): Observable<{ customer: Customer; message: string }> {
    return this.http.post<{ customer: Customer; message: string }>(
      `${this.api}/auth/register`,
      data,
    );
  }

  forgotPassword(email: string): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.api}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.api}/auth/reset-password`, {
      token,
      new_password: newPassword,
    });
  }

  summary(): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(`${this.api}/me`);
  }

  updateProfile(data: ProfileUpdate): Observable<Customer> {
    return this.http.put<Customer>(`${this.api}/me/profile`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.api}/me/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  bills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.api}/me/bills`);
  }

  bill(id: number): Observable<Bill> {
    return this.http.get<Bill>(`${this.api}/me/bills/${id}`);
  }

  recharge(planId: number, card: CardDetails): Observable<Bill> {
    return this.http.post<Bill>(`${this.api}/me/recharges`, { plan_id: planId, card });
  }

  tickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.api}/me/tickets`);
  }

  raiseTicket(description: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.api}/me/tickets`, { description });
  }

  notifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.api}/me/notifications`);
  }

  feedback(data: {
    name: string;
    email: string;
    satisfaction: Satisfaction;
    comments: string;
  }): Observable<unknown> {
    return this.http.post(`${this.api}/feedback`, data);
  }
}
