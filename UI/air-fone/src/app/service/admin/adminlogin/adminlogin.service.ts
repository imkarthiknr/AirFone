import { Admin } from '../../../interface/admin/admin';
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminloginService {

  constructor(private http:HttpClient) { }

  login(uname:string, pass:string ) {
    let url="http://127.0.0.1:4004/adminlogin/";
    return this.http.post<Admin>(url, {"uname":uname, "pass":pass});
        // this is just the HTTP call
}
}
