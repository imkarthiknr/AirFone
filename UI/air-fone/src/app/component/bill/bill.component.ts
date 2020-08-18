import { ActivatedRoute } from '@angular/router';
import { MobilenoService } from './../../service/mobileno.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css']
})
export class BillComponent implements OnInit {

  plan;
  phno;
  description;
  result;
  data=Array()
  amount;
  tariffplan;
  constructor(private http:HttpClient, private mobile : MobilenoService, private route : ActivatedRoute)
  {
    this.data=new Array<any>();
  }
  
  Mobileno:string = this.mobile.PrintMobileNo()
  ngOnInit(): void {
    this.Mobileno = this.mobile.PrintMobileNo()
    console.log(this.Mobileno)

    this.route.queryParams.subscribe(params => {
      this.tariffplan = params['plan'];
      this.amount = params['planamount'];
      console.log(this.amount);
    });
  }

  recharge()
  {
    if ((this.description).toLowerCase()=="prepaid")
    {
      let url="http://127.0.0.1:4003/billings/"+this.phno+"/"+this.plan;
  this.http.post(url,{plan:this.plan}).toPromise().then((data:any)=>{console.log(data)
  console.log(JSON.stringify(data.json))
  //this.result=JSON.stringify(data.json.name)
})
    }
    else if ((this.description).toLowerCase()=="postpaid")
    {
      let url="http://127.0.0.1:4003/billingspostpaids/"+this.phno+"/"+this.plan;
  this.http.post(url,{plan:this.plan}).toPromise().then((data:any)=>{console.log(data)
  console.log(JSON.stringify(data.json))
  //this.result=JSON.stringify(data.json.name)
    })
  }
    else if ((this.description).toLowerCase()=="broadband")
    {
      let url="http://127.0.0.1:4003/billingsbroadbands/"+this.phno+"/"+this.plan;
  this.http.post(url,{plan:this.plan}).toPromise().then((data:any)=>{console.log(data)
  console.log(JSON.stringify(data.json))
  //this.result=JSON.stringify(data.json.name)
})
    }
    else
    {
      alert("Enter valid type")
    }
  }


}
