import { User } from '../interface/users';
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {

  constructor(private http:HttpClient) { }

  login(mobilenumber:string, pass:string ) {
    let url="http://127.0.0.1:4003/login";
    return this.http.post<User>(url, {"mobileno":mobilenumber, "Pwd":pass});
        // this is just the HTTP call
        
}
}