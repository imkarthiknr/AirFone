import { CustomerService } from './../../service/customer.service';
//import { Component } from '@angular/core';
import { Component,OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, Validators, FormGroup} from '@angular/forms'
import {HttpClientModule} from '@angular/common/http'
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  CName='';
  DOB='';
  Email='';
  Pwd='';
  Occupation='';
  AadharNumber='';
  HouseNo='';
  Street='';
  City='';
  State='';
  pincode='';
  Type_Cust='';
  data=Array();
  result;
  result1;
  result2;
  result3;
  result4;
  result5;
  result6;
  result7;
  result8;
  result9;
  result11;
  count=0;
  constructor(private http:HttpClient)
  {
    this.data=new Array<any>();
  }

  ngOnInit(): void {
  }

  selectedOption: string;
  printedOption: string;

  options = [
    { name: "prepaid", value: "prepaid" },
    { name: "postpaid", value: "postpaid" },
    { name:"broadband", value:"broadband"}
  ]
//sleep function used for sleep
  sleep = ( ms ) => {
    const end = +(new Date()) + ms;
    while( +(new Date()) < end ){ } 
}

  register()
  {
    this.Type_Cust = this.selectedOption;
    //console.log(this.printedOption);
    if (this.CName=='' || this.DOB=='' || this.Email=='' || this.Pwd=='' || this.AadharNumber=='' || this.Occupation=='' || this.HouseNo=='' || this.Street=='' || this.City=='' || this.State=='' || this.pincode=='' || this.Type_Cust=='')
    {
      alert("Please enter valid details");
    }
    else
    {
    let url="http://127.0.0.1:4003/register";
        this.http.post(url,{CName:this.CName,DOB:this.DOB,Email:this.Email,Pwd:this.Pwd,AadharNumber:this.AadharNumber,Occupation:this.Occupation,HouseNo:this.HouseNo,Street:this.Street,City:this.City,State:this.State,pincode:this.pincode,Type_Cust:this.Type_Cust}).toPromise().then((data:any)=>{console.log(data)
        console.log(JSON.stringify(data.json))
        alert("Registered Successfully!!! Check the mail to get your mobile number")
        //this.result=JSON.stringify(data.json.name)
        })
    }
  }
}
