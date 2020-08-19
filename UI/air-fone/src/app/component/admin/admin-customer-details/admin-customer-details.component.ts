/*importing necessary service, and modules*/
import { Getuser } from '../../../interface/admin/admingetcustomer';
import { AdmingetuserService } from '../../../service/admin/admingetuser/admingetuser.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpResponse,HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-customer-details',
  templateUrl: './admin-customer-details.component.html',
  styleUrls: ['./admin-customer-details.component.css']
})
export class AdminCustomerDetailsComponent implements OnInit {

  /*declaration*/
  data:any;
  users:Getuser[]=[];
  userslist="users";
  mobileno:number;
  private headers= new HttpHeaders({'Content_Type':'application/json'});

  
  constructor(private http:HttpClient,private getuser:AdmingetuserService,private route:Router) { }

  
  /*oninit function to get customer data*/
  ngOnInit(): void {
    this.getuser.getuserdata().subscribe((response)=>{this.users=response.user;
      console.log(response);})
    
  }

  getdata(){
    
  }

  deletecustomer(mobileno){
    if(confirm("Are you Sure?")){
      const url=" http://127.0.0.1:4004/customerdelete/"+mobileno;
      return this.http.delete(url, {headers:this.headers}).toPromise().then((data)=>{console.log(data);
        this.ngOnInit();this.route.navigate(['/AdminCustomerDetails']);

        
      })
      
      
    }
  }
}
