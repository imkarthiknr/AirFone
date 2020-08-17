import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient,HttpResponse,HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AdmincomplaintService {

  constructor(private http:HttpClient) { }

  getcomplaintdata():Observable<any>{
    let url="http://127.0.0.1:4004/complaintdetails/";
    return this.http.get(url);
  }
  getcomplaint(ticketid):Observable<any>{
    let url="http://127.0.0.1:4004/complaintdetail/"+ticketid;
    return this.http.get(url);
  }
}
