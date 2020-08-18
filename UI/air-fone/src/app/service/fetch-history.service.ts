import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { History } from '../interface/history';

@Injectable({
  providedIn: 'root'
})
export class FetchHistoryService {

  private url="http://127.0.0.1:4003/historys/";
  constructor(private http:HttpClient)
  {
  }
  public historyreq(key):Observable<History[]>
  {
    return this.http.get<History[]>(this.url+key);
  }
}
