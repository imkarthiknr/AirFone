import { CustomerService } from './../../service/customer.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
  //template: `<p>Hello</p>`
}) 
export class RegisterComponent implements OnInit{
  registerForm : FormGroup;
 
  constructor(private custService: CustomerService,private Http: HttpClient,private router:Router ) {
        
 
  }
  ngOnInit(): void
  {
    this.registerForm=new FormGroup({
      
      Cname:new FormControl(null,Validators.required),
      DOB:new FormControl(null,Validators.required),
      Email: new FormControl(null,[Validators.required,Validators.email]),
      Pwd: new FormControl(null,[Validators.required,Validators.minLength(4)]),
      AdhaarNumber:new FormControl(null,[Validators.required,Validators.pattern(/^\d{12}$/)]),
      Occupation: new FormControl(null,[Validators.required]),
      Houseno: new FormControl(null,[Validators.required]),
      Street:new FormControl(null,[Validators.required]),
      City: new FormControl(null,[Validators.required]),
      State: new FormControl(null,[Validators.required]),
      pincode: new FormControl(null,[Validators.required]),     
    });
  }

   onsubmit()
   {
    if(this.registerForm.valid==true)
    {
      
      this.custService.sendPostRequest(this.registerForm.get('Cname').value,this.registerForm.get('DOB').value,this.registerForm.get('Email').value,this.registerForm.get('Pwd').value,this.registerForm.get('AdhaarNumber').value,this.registerForm.get('Occupation').value,this.registerForm.get('Houseno').value,this.registerForm.get('Street').value,this.registerForm.get('City').value,this.registerForm.get('State').value,this.registerForm.get('pincode').value)
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

