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
import { Component } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BillComponent } from './component/bill/bill.component';
import { PlansComponent } from './component/plans/plans.component';
import { PrepaidComponent } from './component/prepaid/prepaid.component';
import { PostpaidComponent } from './component/postpaid/postpaid.component';
import { BroadbandComponent } from './component/broadband/broadband.component';
import { PaymentComponent } from './component/payment/payment.component';
import { HelpComponent } from './component/help/help.component';
import { SupportComponent } from './component/support/support.component';
import { FeedbackComponent } from './component/feedback/feedback.component';
import { BillhistoryComponent } from './component/billhistory/billhistory.component';
import { AdminMenuComponent } from './component/admin/admin-menu/admin-menu.component';
import { AdminHeaderComponent } from './component/admin/admin-header/admin-header.component';
import { NotfoundComponent } from './component/notfound/notfound.component';
import { AdminDashboardComponent } from './component/admin/admin-dashboard/admin-dashboard.component';
import { AdminComplaintComponent } from './component/admin/admin-complaint/admin-complaint.component';
import { AdminCustomerDetailsComponent } from './component/admin/admin-customer-details/admin-customer-details.component';
import { AdminLoginComponent } from './component/admin/admin-login/admin-login.component';
import { AdminProfileComponent } from './component/admin/admin-profile/admin-profile.component';
import { AdminComplaintRespondComponent } from './component/admin/admin-complaint-respond/admin-complaint-respond.component';
import { AdminCustomerUpdateComponent } from './component/admin/admin-customer-update/admin-customer-update.component';
import { AdminBillComponent } from './component/admin/admin-bill/admin-bill.component';
import { ForgotpasswordComponent } from './component/forgotpassword/forgotpassword.component';
@NgModule({
  declarations: [
    AppComponent, 
    HomeComponent,
    MenuComponent,
    FooterComponent,
    LoginComponent,
    BillComponent,
    RegisterComponent,
    HeaderComponent,
    DashboardComponent,
    AdsComponent, 
    CustDetailComponent, 
    PlansComponent,
    PrepaidComponent, 
    PostpaidComponent, 
    BroadbandComponent, 
    PaymentComponent, 
    HelpComponent, 
    SupportComponent, 
    FeedbackComponent, 
    BillhistoryComponent, 
    AdminMenuComponent, 
    AdminHeaderComponent, 
    NotfoundComponent, 
    AdminDashboardComponent,
    AdminComplaintComponent, 
    AdminCustomerDetailsComponent, 
    AdminLoginComponent, 
    AdminProfileComponent, 
    AdminComplaintRespondComponent, 
    AdminCustomerUpdateComponent, 
    AdminBillComponent, ForgotpasswordComponent
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
  providers: [], 
  bootstrap: [AppComponent]
})
export class AppModule { }
