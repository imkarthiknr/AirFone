import { AdminloginService } from '../../../service/admin/adminlogin/adminlogin.service';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {

  public adminloginform;
  constructor(private router:Router,private auth:AdminloginService) { }

  ngOnInit(): void {
    this.adminloginform=new FormGroup({
      uname:new FormControl('',Validators.required),
      u_password:new FormControl('',Validators.required)
    })
  }

  onSubmit(){
    const val = this.adminloginform.value;

        if (val.uname && val.u_password) {
            this.auth.login(val.uname, val.u_password)
                .subscribe(
                    (response) => {let x =JSON.parse(JSON.stringify(response));

                      if (x.adminlogin==="success"){
                        console.log("User is logged in");
                        
                        this.router.navigate(['/admindashboard'],{queryParams:{admin:val.uname}});

                      }
                      else{
                        console.log(response)
                        alert("Invalid Username or password");

                      }
                    }
                );
                  }
  }

}
