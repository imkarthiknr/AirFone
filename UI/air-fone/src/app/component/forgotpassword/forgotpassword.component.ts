import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';


@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {

  public forgetpassword;
  result:string;
  constructor(private http:HttpClient) { }

  ngOnInit(): void {
      this.forgetpassword=new FormGroup({
      email:new FormControl('',Validators.required),
    })
  }
  onSubmit(){
    const val=this.forgetpassword.value
    let url="http://127.0.0.1:4003/email/"+val.email;
    this.http.get(url).subscribe((response:any)=>{console.log(response);this.result=response;
      if(response.result=="success"){
        alert("Yours Password is sent to Your corrosponding Mail Id")
      }
      else{
        alert("Mail Id is not matched")
      }
    })
    console.log(this.result)
    
    
  }

}
