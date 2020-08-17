import { Injectable } from '@angular/core';
import { HttpClient,HttpResponse,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GetuserService {

  constructor(private http:HttpClient) { }

  getuserdata():Observable<any>{
    let url="http://127.0.0.1:4004/customerdetails/";
    return this.http.get(url);
  }
}
