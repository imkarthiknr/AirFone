import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {

  user;
email_id;
description;
result;
data=Array()
  constructor(private http:HttpClient)
  {
    this.data=new Array<any>();
  }

  ngOnInit(): void {
  }

  help()
  {
    let url="http://127.0.0.1:4003/helps/"+this.email_id;
this.http.post(url,{name:this.user,description:this.description}).toPromise().then((data:any)=>{console.log(data)
console.log(JSON.stringify(data.json))
//this.result=JSON.stringify(data.json.name)
})
  }
}
