import { Complaint } from './../../interface/complaint';
import { Singlecomplaint } from './../../interface/singlecomplaint';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdmincomplaintService } from 'src/app/service/admincomplaint.service';
import {FormGroup,FormControl,Validators} from '@angular/forms';


@Component({
  selector: 'app-adminrespond',
  templateUrl: './adminrespond.component.html',
  styleUrls: ['./adminrespond.component.css']
})
export class AdminrespondComponent implements OnInit {
  ticketid:any;
  single_complaint:Singlecomplaint[]=[];
  public mailform;


  constructor(private route:ActivatedRoute,private getcomplaint:AdmincomplaintService) { }

  ngOnInit(): void {
    this.mailform=new FormGroup({
      ticketid:new FormControl('',Validators.required),
      name:new FormControl('',Validators.required),
      email:new FormControl('',Validators.required),
      description:new FormControl('',Validators.required),
      attender:new FormControl('',Validators.required),
      mobilenumber:new FormControl('',Validators.required)
    })

    this.route.params.subscribe(params=>{this.ticketid=+params['id'];console.log(this.ticketid)})
    this.getcomplaint.getcomplaint(this.ticketid).subscribe((response)=>{this.single_complaint=response.complaint;
      console.log(this.single_complaint)})
  }

  Sendmail(){
    
  }

}
