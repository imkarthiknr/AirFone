import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AdminprofileService {

  constructor(private http:HttpClient) { }

  getadmindata():Observable<any>{
    let url="http://127.0.0.1:4004/adminprofile/";
    return this.http.get(url);
  }
}
