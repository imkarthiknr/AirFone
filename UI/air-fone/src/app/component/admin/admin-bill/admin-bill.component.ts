/*importing necessary service, and modules*/
import { AdminbillService } from './../../../service/admin/adminbill/adminbill.service';
import { Bill } from '../../../interface/admin/adminbill';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';

@Component({
  selector: 'app-admin-bill',
  templateUrl: './admin-bill.component.html',
  styleUrls: ['./admin-bill.component.css']
})
export class AdminBillComponent implements OnInit {

  /*declaration*/
  public billform;
  isshow=true;
  billdetail:Bill[]=[]
  constructor(private bill:AdminbillService) { }
  
  /*form validation*/
  ngOnInit(): void {
    this.billform=new FormGroup({
      startdate:new FormControl('',Validators.required),
      enddate:new FormControl('',Validators.required),
      Customertype:new FormControl('',Validators.required)
    })

  }

  /*onsubmit function*/
  onSubmit(){
    this.isshow=false;
    const val=this.billform.value;
    this.bill.getbilldata(val.startdate,val.enddate,val.Customertype).subscribe((response)=>{this.billdetail=response.Bill;
      console.log(response);
    console.log(this.billdetail);})
  }


}
