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
  title = 'register';

  registerForm: FormGroup;
  
  ngOnInit(): void {
 

  this.registerForm=new FormGroup({
      
    CName:new FormControl(null,Validators.required),
    DOB:new FormControl(null,Validators.required),
    Email: new FormControl(null,[Validators.required,Validators.email]),
    Pwd: new FormControl(null,[Validators.required,Validators.minLength(4),Validators.pattern("/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/")]),
    AdhaarNumber:new FormControl(null,[Validators.required]),
    Occupation: new FormControl(null,[Validators.required]),
    Houseno : new FormControl(null,[Validators.required]),
    Street :new FormControl(null,[Validators.required]),
    City : new FormControl(null,[Validators.required]),
    State : new FormControl(null,[Validators.required]),
    pincode : new FormControl(null,[Validators.required]),
    Type_Cust :new FormControl(null,[Validators.required]), 	
    

  });


  }
  constructor(private http:HttpClient, private customer:CustomerService){  
  }
  onsubmit(){
    {
     
      if (this.registerForm.get('CName').value !== "" && this.registerForm.get('Email').value !== "" && this.registerForm.get('Pwd').value !== "" && this.registerForm.get('AadharNumber').value !== "" && this.registerForm.get('Type_Cast').value !== "")
      {
        this.customer.sendPostRequest(this.registerForm.get('Cname').value, this.registerForm.get('DOB').value,this.registerForm.get('Email').value, this.registerForm.get('Pwd').value, this.registerForm.get('AadharNumber').value, this.registerForm.get('Occupation').value, this.registerForm.get('Houseno').value, this.registerForm.get('Street').value(), this.registerForm.get('City').value, this.registerForm.get('State').value, this.registerForm.get('pincode').value, this.registerForm.get('Type_Cast').value )
          .subscribe(response=>{
            console.log(response);
            let jsonObj = JSON.parse(JSON.stringify(response));
            if(jsonObj.updation === "success"){
              alert("Successfully Updated");
            }
      });
      }
      else {
        alert("Enter proper details");
      }

  
  

}

}
}
