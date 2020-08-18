import { Bill } from './../../interface/bill';
import { BillgenerationService } from './../../service/billgeneration.service';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';

@Component({
  selector: 'app-billgeneration',
  templateUrl: './billgeneration.component.html',
  styleUrls: ['./billgeneration.component.css']
})
export class BillgenerationComponent implements OnInit {

  public billform;
  isshow=true;
  billdetail:Bill[]=[]
  constructor(private bill:BillgenerationService) { }

  ngOnInit(): void {
    this.billform=new FormGroup({
      startdate:new FormControl('',Validators.required),
      enddate:new FormControl('',Validators.required),
      Customertype:new FormControl('',Validators.required)
    })

  }


  onSubmit(){
    this.isshow=false;
    const val=this.billform.value;
    this.bill.getbilldata(val.startdate,val.enddate,val.Customertype).subscribe((response)=>{this.billdetail=response.Bill;
      console.log(response);
    console.log(this.billdetail);})
  }


}
