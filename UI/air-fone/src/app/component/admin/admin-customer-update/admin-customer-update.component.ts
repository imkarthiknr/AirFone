import { AdmingetsingleuserService } from './../../../service/admin/admingetsingleuser/admingetsingleuser.service';
import { AdmingetuserService } from '../../../service/admin/admingetuser/admingetuser.service';
import { Getuser } from '../../../interface/admin/admingetcustomer';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';
import { HttpClient,HttpResponse,HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-customer-update',
  templateUrl: './admin-customer-update.component.html',
  styleUrls: ['./admin-customer-update.component.css']
})
export class AdminCustomerUpdateComponent implements OnInit {

 
  public updateform;
  mobileno:any;
  users:Getuser[]=[];
  data:object=[];
  customerObj:object=[];

  private headers= new HttpHeaders({'Content_Type':'application/json'});

  constructor(private router:Router,private route:ActivatedRoute,private http:HttpClient,private getuser:AdmingetuserService,private getsingleuser:AdmingetsingleuserService ) { }

  ngOnInit(): void {
      this.updateform=new FormGroup({
      mno:new FormControl('',Validators.required),
      uname:new FormControl('',Validators.required),
      upassword:new FormControl('',Validators.required),
      typecust:new FormControl('',Validators.required)
    })

    
    this.route.params.subscribe(params=>{this.mobileno=+params['mobileno'];console.log(this.mobileno)})
    this.getsingleuser.getuserdata(this.mobileno).subscribe((response)=>{this.users=response.user;
      console.log(response);
      console.log(this.users)})
  }
  
  updatecustomer(){
    const val = this.updateform.value;
    let url="http://127.0.0.1:4004/customerupdate/"+this.updateform.get('mno').value;
    this.http.put(url,{CName:this.updateform.get('uname').value,Pwd:this.updateform.get('upassword').value,Type_cust:this.updateform.get('typecust').value}).toPromise().then((data:any)=>{console.log(data);})

  }
}
