/*importing necessary service, and modules*/
import { Complaint } from '../../../interface/admin/admincomplaint';
import { Singlecomplaint } from '../../../interface/admin/adminsinglecomplaint';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdmincomplaintService } from 'src/app/service/admin/admincomplaint/admincomplaint.service';
import {FormGroup,FormControl,Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-admin-complaint-respond',
  templateUrl: './admin-complaint-respond.component.html',
  styleUrls: ['./admin-complaint-respond.component.css']
})
export class AdminComplaintRespondComponent implements OnInit {
  
  /*declaration*/
  ticketid:any;
  single_complaint:Singlecomplaint[]=[];
  public mailform;


  constructor(private route:ActivatedRoute,private getcomplaint:AdmincomplaintService,private http:HttpClient) { }
  
  /*form validation*/
  ngOnInit(): void {
    this.mailform=new FormGroup({
      ticketid:new FormControl('',Validators.required),
      name:new FormControl('',Validators.required),
      email:new FormControl('',Validators.required),
      description:new FormControl('',Validators.required),
      attender:new FormControl('',Validators.required),
      mobilenumber:new FormControl('',Validators.required),
      response: new FormControl('')
    })
    
    /*getting query param details fetching complaint data*/
    this.route.params.subscribe(params=>{this.ticketid=+params['id'];console.log(this.ticketid)})
    this.getcomplaint.getcomplaint(this.ticketid).subscribe((response)=>{this.single_complaint=response.complaint;
      console.log(this.single_complaint)})
  }

  /*sending mail response using http call post*/
  Sendmail(){
    const val = this.mailform.value;
    let url="http://127.0.0.1:4004/sendmail/"+val.email+"/"+val.name+"/"+val.description+"/"+val.response+"/"+val.attender;
    this.http.post(url,{}).toPromise().then((response:any)=>{console.log(response);})
    alert("Mail sent!!!")

  }

}
