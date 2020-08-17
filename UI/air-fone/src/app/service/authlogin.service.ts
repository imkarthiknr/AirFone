import { admin } from './../interface/adminlogin';
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthloginService {

  constructor(private http:HttpClient) { }

  login(uname:string, pass:string ) {
    let url="http://127.0.0.1:4004/adminlogin/";
    return this.http.post<admin>(url, {"uname":uname, "pass":pass});
        // this is just the HTTP call
}
}
