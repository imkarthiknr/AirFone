import { Injectable } from '@angular/core';
import { HttpClient,HttpResponse,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BillgenerationService {

  constructor(private http:HttpClient) { }

  getbilldata(start:string,end:string):Observable<any>{
    let url="http://127.0.0.1:4004/billgenerate/"+start+"/"+end;
    return this.http.get(url);
}
}
