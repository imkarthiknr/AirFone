import { CustomerbillService } from './../../service/customerbill.service';
import { CustomerBill } from './../../interface/customerbill';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl,Validators} from '@angular/forms';

@Component({
  selector: 'app-customerbillhistory',
  templateUrl: './customerbillhistory.component.html',
  styleUrls: ['./customerbillhistory.component.css']
})
export class CustomerbillhistoryComponent implements OnInit {
  public customerbillform;
  isshow=true;
  billdetail:CustomerBill[]=[]
  constructor(private customerbill:CustomerbillService) { }

  ngOnInit(): void {
    this.customerbillform=new FormGroup({
      mobilenumber:new FormControl('',Validators.required)
    })
  }

  onSubmit(){
    this.isshow=false;
    const val=this.customerbillform.value;
    this.customerbill.getcustomerbilldata(val.mobilenumber).subscribe((response)=>{this.billdetail=response.billing;
      console.log(response);
    console.log(this.billdetail);})

  }

}
