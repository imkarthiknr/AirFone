import { CustomerbillService } from '../../service/customerbill.service';
import { CustomerBill } from './../../interface/customerbill';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';
import { MobilenoService } from './../../service/mobileno.service';
@Component({
  selector: 'app-billhistory',
  templateUrl: './billhistory.component.html',
  styleUrls: ['./billhistory.component.css']
})
export class BillhistoryComponent implements OnInit {
  public customerbillform;
  isshow=true;
  billdetail:CustomerBill[]=[]
  Mobileno;
  constructor(private customerbill:CustomerbillService, private mobile:MobilenoService) { }
  
  ngOnInit(): void {
    this.customerbillform=new FormGroup({
      mobilenumber:new FormControl('',Validators.required)
    })
    this.Mobileno = this.mobile.PrintMobileNo()
    console.log(this.Mobileno)
  }

  onSubmit(){
    this.isshow=false;
    const val=this.customerbillform.value;
    this.customerbill.getcustomerbilldata(val.mobilenumber).subscribe((response)=>{this.billdetail=response.billing;
      console.log(response);
    console.log(this.billdetail);})

  }

  

}
