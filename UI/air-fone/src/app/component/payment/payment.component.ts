import { ActivatedRoute, Router } from '@angular/router';
import { PaymentstoreService } from './../../service/paymentstore.service';
import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
    paymentGateway =new FormGroup({
    Name: new FormControl('',Validators.required),
    email: new FormControl('',[Validators.required,Validators.email]),
    phone: new FormControl('',[Validators.required,Validators.minLength(10)]),
    CName: new FormControl('',Validators.required),
    cardnumber: new FormControl('',[Validators.required,Validators.minLength(22)]),
    expmonth: new FormControl('',Validators.required),
    expyear: new FormControl('',Validators.required),
    cvv: new FormControl('',Validators.required),
  })

  constructor(private payment : PaymentstoreService, private router : Router) { }

  ngOnInit(): void {
  }

  onSubmit()
  {
    const val = this.paymentGateway.value;
    if (val.Name && val.email && val.phone && val.CName && val.cardnumber && val.expyear && val.cvv)
    {
      this.payment.paymentauth(val.Name,val.email,val.phone,val.CName,val.cardnumber,val.expmonth,val.expyear,val.cvv)
      .subscribe(
        (response) => {
          console.log(response)
          this.router.navigate(['/Feedback'],{queryParams:{mobilenumber:val.phone}});
        }
      )
    }
  }

}
