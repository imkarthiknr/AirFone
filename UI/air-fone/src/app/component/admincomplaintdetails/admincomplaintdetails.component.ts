import { Complaint } from './../../interface/complaint';
import { AdmincomplaintService } from './../../service/admincomplaint.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-admincomplaintdetails',
  templateUrl: './admincomplaintdetails.component.html',
  styleUrls: ['./admincomplaintdetails.component.css']
})
export class AdmincomplaintdetailsComponent implements OnInit {
  
  complaints:Complaint[]=[];
  constructor(private clientcomplaint:AdmincomplaintService) { }

  ngOnInit(): void {
    this.clientcomplaint.getcomplaintdata().subscribe((response)=>{this.complaints=response.complaint;
      console.log(response);})
    
  }

}
