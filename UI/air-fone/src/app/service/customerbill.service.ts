import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CustomerbillService {

  constructor(private http:HttpClient) { }

  getcustomerbilldata(mobileno:string):Observable<any>{
    let url="http://127.0.0.1:4004/customerbillhistory/"+mobileno;
    return this.http.get(url);
}
}
