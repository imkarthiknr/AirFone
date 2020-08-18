import { Component, OnInit } from '@angular/core';
import { History } from '../../interface/history';
import { Subscription } from 'rxjs';
import { FetchHistoryService } from '../../service/fetch-history.service' 
@Component({
  selector: 'app-billhistory',
  templateUrl: './billhistory.component.html',
  styleUrls: ['./billhistory.component.css']
})
export class BillhistoryComponent implements OnInit {
  phno;
  list=new Array<History>();
  private subscp= new Subscription;
    constructor(private fetch : FetchHistoryService)
    {
    }
  
    ngOnInit(): void {
    }
  
  
  history()
  {
    this.fetch
    .historyreq(this.phno)
    .subscribe( response=>{
      this.list=response["billing"].map(item=>{
        return new History(
          item.billing_id,
          item.MobileNo,
          item.Benefits,
          item.price,
          item.start,
          item.end
        );
      });
  
    });
  }
  

}
