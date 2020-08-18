import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobilenoService {

  constructor() { }
  private mobileNo:string;
  private planamount:string;
  FetchMobileNo(mobileno)
  {
    this.mobileNo =  mobileno;
  }
  
  PrintMobileNo (){
    return this.mobileNo;
  }

  fetchPlanAmount(planamount)
  {
    this.planamount = planamount;
  }

  printPlanAmount()
  {
    return this.planamount;
  }
}
