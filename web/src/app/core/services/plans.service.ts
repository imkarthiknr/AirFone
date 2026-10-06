import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API_URL } from '../api';
import { Plan, PlanCategory } from '../models';

@Injectable({ providedIn: 'root' })
export class PlansService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  /** The catalogue rarely changes, so all plans are fetched once and shared. */
  private readonly all$ = this.http.get<Plan[]>(`${this.api}/plans`).pipe(shareReplay(1));

  all(): Observable<Plan[]> {
    return this.all$;
  }

  byCategory(category: PlanCategory): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.api}/plans`, {
      params: new HttpParams().set('category', category),
    });
  }

  get(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.api}/plans/${id}`);
  }
}
