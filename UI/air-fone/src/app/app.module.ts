import { CustomerbillService } from './service/customerbill.service';
import { AdmincomplaintService } from './service/admincomplaint.service';
import { AdminprofileService } from './service/adminprofile.service';
import { BillgenerationService } from './service/billgeneration.service';
import { GetsingleuserService } from './service/getsingleuser.service';
import { GetuserService } from './service/getuser.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms'; 
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './component/home/home.component';
import { MenuComponent } from './component/menu/menu.component';
import { FooterComponent } from './component/footer/footer.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { HeaderComponent } from './component/header/header.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { AdsComponent } from './component/ads/ads.component';
import { CustDetailComponent } from './component/cust-detail/cust-detail.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
//import { CarouselModule } from '@bit/valor-software.ngx-bootstrap.carousel';
import { Component } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BillComponent } from './component/bill/bill.component';
import { CustomerdetailsComponent } from './component/customerdetails/customerdetails.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { AdmindashboardComponent } from './component/admindashboard/admindashboard.component';
import { UpdatecustomerComponent } from './component/updatecustomer/updatecustomer.component';
import { BillgenerationComponent } from './component/billgeneration/billgeneration.component';
import { AdminprofileComponent } from './component/adminprofile/adminprofile.component';
import { AdmincomplaintdetailsComponent } from './component/admincomplaintdetails/admincomplaintdetails.component';
import { AdminrespondComponent } from './component/adminrespond/adminrespond.component';
import { AdminloginComponent } from './component/adminlogin/adminlogin.component';
import { AdminheaderComponent } from './component/adminheader/adminheader.component';
import { CustomerbillhistoryComponent } from './component/customerbillhistory/customerbillhistory.component';
import { ForgotpasswordComponent } from './component/forgotpassword/forgotpassword.component';
@NgModule({
  declarations: [
    AppComponent, 
    HomeComponent,
    MenuComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    DashboardComponent,
    AdsComponent, 
    CustDetailComponent, BillComponent, CustomerdetailsComponent, NavbarComponent, AdmindashboardComponent, UpdatecustomerComponent, BillgenerationComponent, AdminprofileComponent, AdmincomplaintdetailsComponent, AdminrespondComponent, AdminloginComponent, AdminheaderComponent,CustomerbillhistoryComponent, ForgotpasswordComponent
  ],
  imports: [  
    BrowserModule,
    AppRoutingModule,
    FormsModule, 
    CarouselModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    BrowserAnimationsModule
  ],
  providers: [AdminprofileService,GetuserService,GetsingleuserService,BillgenerationService,AdmincomplaintService,CustomerbillService], 
  bootstrap: [AppComponent,HomeComponent]
})
export class AppModule { }
