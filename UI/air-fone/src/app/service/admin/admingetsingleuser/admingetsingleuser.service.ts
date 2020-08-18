import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdmingetsingleuserService {

  constructor(private http:HttpClient) { }

  getuserdata(mobileno):Observable<any>{
    let url="http://127.0.0.1:4004/customerdetail/"+mobileno;
    return this.http.get(url);
  }
}
