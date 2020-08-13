import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginform;
  mobnumber:string;
  password:string;
  result1:string;
  result2:string;
  constructor(private http:HttpClient,private router:Router) { }

  ngOnInit(): void {
    this.loginform=new FormGroup({
      m_number:new FormControl('',[Validators.required,Validators.pattern("^[0-9]{10}$")]),
      u_password:new FormControl('',Validators.required)
    })
  }

  onSubmit(){
    let url="http://127.0.0.1:4003/login/"+this.mobnumber+"/"+this.password;
    this.http.get(url).subscribe((data:any)=>{console.log(JSON.stringify(data))
    this.result1=JSON.stringify(data.mobilenumber)
    this.result2=JSON.stringify(data.password);
    })
    if ((this.result1 && this.result2) == (this.mobnumber && this.password)){
    this.router.navigate(['/dashboard']);
    }
}
}
