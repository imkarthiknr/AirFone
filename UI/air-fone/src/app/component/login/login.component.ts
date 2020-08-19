import { MobilenoService } from './../../service/mobileno.service';
import { AuthserviceService } from '../../service/authservice.service';
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
  constructor(private http:HttpClient,private router:Router,private auth:AuthserviceService) { }

  ngOnInit(): void {
    this.loginform=new FormGroup({
      m_number:new FormControl('',Validators.required),
      u_password:new FormControl('',Validators.required)
    })
  }
 
  
  onSubmit()
  {
        const val = this.loginform.value;
        if (val.m_number && val.u_password) 
        {
            this.auth.login(val.m_number, val.u_password)
                .subscribe(
                    () => {
                        console.log("User is logged in");
                        this.router.navigate(['/Dashboard'],{queryParams:{mobilenumber:val.m_number}});
                    }
                );
        }
    
    }

    forgetpassword()
    {
      const val = this.loginform.value;
      this.router.navigate(['/Login/ForgotPassword'],{queryParams:{mobilenumber:val.m_number}});
    }
  }

