import { AdmincomplaintService } from 'src/app/service/admin/admincomplaint/admincomplaint.service';
import { Component, OnInit } from '@angular/core';
import { Complaint } from '../../../interface/admin/admincomplaint';

@Component({
  selector: 'app-admin-complaint',
  templateUrl: './admin-complaint.component.html',
  styleUrls: ['./admin-complaint.component.css']
})
export class AdminComplaintComponent implements OnInit {

  complaints:Complaint[]=[];
  constructor(private clientcomplaint:AdmincomplaintService) { }

  ngOnInit(): void {
    this.clientcomplaint.getcomplaintdata().subscribe((response)=>{this.complaints=response.complaint;
      console.log(response);})
    
  }
}
