import { CustomerService } from './../../service/customer.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import {FormsModule} from '@angular/forms'
import {HttpClient} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  registerForm : FormGroup;
 
  constructor(private custService: CustomerService,private Http: HttpClient,private router:Router ) {}
  ngOnInit()
  {
    
    this.registerForm=new FormGroup({
      
      'Cname':new FormControl(null,Validators.required),
      'DOB':new FormControl(null,Validators.required),
      'Email': new FormControl(null,[Validators.required,Validators.email]),
      'Pwd': new FormControl(null,[Validators.required,Validators.minLength(4)]),
      'AdhaarNumber':new FormControl(null,[Validators.required,Validators.pattern(/^\d{12}$/)]),
      'Occupation': new FormControl(null,[Validators.required]),
      'Houseno': new FormControl(null,[Validators.required]),
      'Street':new FormControl(null,[Validators.required]),
      'City': new FormControl(null,[Validators.required]),
      'State': new FormControl(null,[Validators.required]),
      'pincode': new FormControl(null,[Validators.required]),     
    });
  }
  Cname = this.registerForm.get('Cname').value
  DOB = this.registerForm.get('DOB').value
  Email = this.registerForm.get('Email').value
  Pwd = this.registerForm.get('Pwd').value
  AdhaarNumber = this.registerForm.get('AdhaarNumber').value
  Occupation = this.registerForm.get('Occupation').value
  Houseno = this.registerForm.get('Houseno').value
  Street = this.registerForm.get('Street').value
  City = this.registerForm.get('City').value
  State = this.registerForm.get('State').value
  pincode = this.registerForm.get('pincode').value

   onsubmit()
   {
    if(this.registerForm.valid==true)
    {
      
      this.custService.sendPostRequest(this.Cname,this.DOB,this.Email,this.Pwd,this.AdhaarNumber,this.Occupation,this.Houseno,this.Street,this.City,this.State,this.pincode)
      .subscribe(response=>{
        console.log(response);
        let jsonObj = JSON.parse(JSON.stringify(response));
        if(jsonObj.Registration === "success"){
          alert("Successfully Inserted");
        }
        this.router.navigate(['/dashboard']);

  })
    

  }
  else
  {
    alert("Enter All fields");
  }
}
}
