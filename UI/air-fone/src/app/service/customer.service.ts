import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  
  private url = "http://127.0.0.1:4003/register/";

  constructor( public httpClient: HttpClient) { }
  public sendPostRequest(Cname, DOB, Email, Pwd, AadharNumber, Occupation, Houseno, Street, City, State, pincode) {
    return this.httpClient.post(this.url,{"CName": Cname,"DOB": DOB,"Email": Email, "Pwd": Pwd, "AadharNumber": AadharNumber, "Occupation": Occupation, "HouseNo":Houseno,"Street": Street, "City":City, "State": State, "pincode": pincode});
  }
}
