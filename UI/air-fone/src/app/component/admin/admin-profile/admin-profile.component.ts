/*importing necessary service, and modules*/
import { HttpClient } from '@angular/common/http';
import { Admin } from '../../../interface/admin/admin';
import { AdminprofileService } from '../../../service/admin/adminprofile/adminprofile.service';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {

  /*declaration*/
  public adminform;
  admindetail:Admin[]=[];
  constructor(private http:HttpClient,private admin:AdminprofileService) { }

  /*form validation,fetching admin credential data*/
  ngOnInit(): void {
    this.adminform=new FormGroup({
      adminid:new FormControl('',Validators.required),
      auname:new FormControl('',Validators.required),
      apassword:new FormControl('',Validators.required)
    })
    this.admin.getadmindata().subscribe((response)=>{this.admindetail=response.admin;
      console.log(response);
      console.log(this.admindetail)})
  }

  /*onsubmit function to pass the updated customer*/
  onSubmit(){
    const val = this.adminform.value;
    let url="http://127.0.0.1:4004/adminupdate/"+this.adminform.get('adminid').value;
    this.http.put(url,{adminname:this.adminform.get('auname').value,adminpassword:this.adminform.get('apassword').value}).toPromise().then((data:any)=>{console.log(data);})
    alert("Profile Details Updated!!")
  }
}
