import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  
  private url = "http://127.0.0.1:4003/register/";

  constructor( public httpClient: HttpClient) { }
  public sendPostRequest(CName, DOB, Email, Pwd, AadharNumber, Occupation, Houseno, Street, City, State, pincode, Type_Cast) {
    return this.httpClient.post(this.url,{"CName": CName,"DOB": DOB,"Email": Email, "Pwd": Pwd, "AadharNumber": AadharNumber, "Occupation": Occupation, "HouseNo":Houseno,"Street": Street, "City":City, "State": State, "pincode": pincode, "Type_Cast" : Type_Cast});
  }
}