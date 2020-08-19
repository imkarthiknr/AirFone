import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  constructor(private http:HttpClient, private mobile : MobilenoService, private route : ActivatedRoute, private router: Router)
  {
    this.data=new Array<any>();
  }
  billForm;
  
  Mobileno:string = this.mobile.PrintMobileNo()
  ngOnInit(): void {
    this.Mobileno = this.mobile.PrintMobileNo()
    console.log(this.Mobileno)

    this.billForm = new FormGroup ({
        Mobileno1 : new FormControl('',Validators.required),
        plan : new FormControl('',Validators.required),
        description : new FormControl('',Validators.required)
    })

    this.route.queryParams.subscribe(params => {
      this.tariffplan = params['plan'];
      this.amount = params['planamount'];
      console.log(this.amount);
    });
  }

  recharge()
  {
    const v = this.billForm.value;
    if (v.description=="prepaid")
    {
      let url="http://127.0.0.1:4003/billings/"+v.Mobileno1+"/"+v.plan;
  this.http.post(url,{plan:v.plan}).toPromise().then((data:any)=>{console.log(data)
  console.log(JSON.stringify(data.json))
  //this.result=JSON.stringify(data.json.name)
}) 
    }
    else if ((v.description)=="postpaid")
    {
      let url="http://127.0.0.1:4003/billingspostpaids/"+v.Mobileno1+"/"+v.plan;
  this.http.post(url,{plan:v.plan}).toPromise().then((data:any)=>{console.log(data)
  console.log(JSON.stringify(data.json))
  //this.result=JSON.stringify(data.json.name)
    })
  }
    else if (v.description=="broadband")
    {
      let url="http://127.0.0.1:4003/billingsbroadbands/"+v.Mobileno1+"/"+v.plan;
  this.http.post(url,{plan:v.plan}).toPromise().then((data:any)=>{console.log(data)
  console.log(JSON.stringify(data.json))
  //this.result=JSON.stringify(data.json.name)
  this.router.navigate(['/Payment'])
  
})
    }
    else
    {
      alert("Enter valid type")
    }
  }


}
