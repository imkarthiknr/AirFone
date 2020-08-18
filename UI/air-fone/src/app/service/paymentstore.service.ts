import { Payment } from './../interface/payment';
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentstoreService {

  constructor(private http : HttpClient) { }
  paymentauth(Name,email,phone,CName,cardnumber,expmonth,expyear,cvv) {
    let url="http://127.0.0.1:4003/payment";
    return this.http.post<Payment>(url,{"name" : Name, "email" : email, "mobile" : phone, "cname" : CName, "cnum" : cardnumber, "expmonth" : expmonth, "expyear" : expyear, "cvv" : cvv});
        // this is just the HTTP call
        
  }
}
