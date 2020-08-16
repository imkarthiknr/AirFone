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

  onSubmit(){
    const val = this.loginform.value;

        if (val.m_number && val.u_password) {
            this.auth.login(val.m_number, val.u_password)
                .subscribe(
                    () => {
                        console.log("User is logged in");
                        this.router.navigate(['/dashboard'],{queryParams:{uname:val.m_number}});
                    }
                );
                  }
    
}
  }
