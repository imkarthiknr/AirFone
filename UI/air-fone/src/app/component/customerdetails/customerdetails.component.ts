import { Getuser } from './../../interface/getuser';
import { GetuserService } from './../../service/getuser.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpResponse,HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';



@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css']
})
export class CustomerdetailsComponent implements OnInit {

  data:any;
  users:Getuser[]=[];
  userslist="users";
  mobileno:number;
  private headers= new HttpHeaders({'Content_Type':'application/json'});

  
  constructor(private http:HttpClient,private getuser:GetuserService,private route:Router) { }

  
  
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
        this.ngOnInit();this.route.navigate(['/customerdetails']);
        
      })
      
      
    }
  }

}
