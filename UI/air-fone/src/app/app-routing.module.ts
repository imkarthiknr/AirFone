import { AdminloginComponent } from './component/adminlogin/adminlogin.component';
import { AdminrespondComponent } from './component/adminrespond/adminrespond.component';
import { AdmincomplaintdetailsComponent } from './component/admincomplaintdetails/admincomplaintdetails.component';
import { AdminprofileComponent } from './component/adminprofile/adminprofile.component';
import { BillgenerationComponent } from './component/billgeneration/billgeneration.component';
import { UpdatecustomerComponent } from './component/updatecustomer/updatecustomer.component';
import { AdmindashboardComponent } from './component/admindashboard/admindashboard.component';
import { CustDetailComponent } from './component/cust-detail/cust-detail.component';
import { AdsComponent } from './component/ads/ads.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { FooterComponent } from './component/footer/footer.component';
import { HeaderComponent } from './component/header/header.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { MenuComponent } from './component/menu/menu.component';
import { HomeComponent } from './component/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerdetailsComponent } from './component/customerdetails/customerdetails.component';



const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'Dashboard', component: DashboardComponent},
  {path: 'Login', component: LoginComponent},
  {path: 'Register', component: RegisterComponent},
  {path:'customerdetails',component:CustomerdetailsComponent},
  {path:'admindashboard',component:AdmindashboardComponent},
  {path:'updatecustomer/:mobileno',component:UpdatecustomerComponent},
  {path:'billgeneration',component:BillgenerationComponent},
  {path:'adminprofile',component:AdminprofileComponent},
  {path:'admincomplaintpage',component:AdmincomplaintdetailsComponent},
  {path:'mail/:id',component:AdminrespondComponent},
  {path:'adminlogin',component:AdminloginComponent},
];

 
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
