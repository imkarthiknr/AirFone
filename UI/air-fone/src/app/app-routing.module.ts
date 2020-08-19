import { ForgotpasswordComponent } from './component/forgotpassword/forgotpassword.component';
import { AdminBillComponent } from './component/admin/admin-bill/admin-bill.component';
import { AdminComplaintRespondComponent } from './component/admin/admin-complaint-respond/admin-complaint-respond.component';
import { AdminComplaintComponent } from './component/admin/admin-complaint/admin-complaint.component';
import { AdminProfileComponent } from './component/admin/admin-profile/admin-profile.component';
import { AdminLoginComponent } from './component/admin/admin-login/admin-login.component';
import { AdminCustomerUpdateComponent } from './component/admin/admin-customer-update/admin-customer-update.component';
import { AdminCustomerDetailsComponent } from './component/admin/admin-customer-details/admin-customer-details.component';
import { AdminDashboardComponent } from './component/admin/admin-dashboard/admin-dashboard.component';
import { NotfoundComponent } from './component/notfound/notfound.component';
import { BillhistoryComponent } from './component/billhistory/billhistory.component';
import { FeedbackComponent } from './component/feedback/feedback.component';
import { SupportComponent } from './component/support/support.component';
import { HelpComponent } from './component/help/help.component';
import { PaymentComponent } from './component/payment/payment.component';
import { BillComponent } from './component/bill/bill.component';
import { BroadbandComponent } from './component/broadband/broadband.component';
import { PrepaidComponent } from './component/prepaid/prepaid.component';
import { PostpaidComponent } from './component/postpaid/postpaid.component';
import { PlansComponent } from './component/plans/plans.component';
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


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'Dashboard', component: DashboardComponent},
  {path: 'Login', component: LoginComponent},
  {path: 'Login/ForgetPassword', component: ForgotpasswordComponent},
  {path: 'Register', component: RegisterComponent},
  {path: 'Plans', component: PlansComponent},
  {path: 'Bill', component: BillComponent},
  {path: 'Plans/Prepaid', component: PrepaidComponent},
  {path: 'Plans/Postpaid', component: PostpaidComponent},
  {path: 'Plans/Broadband', component: BroadbandComponent},
  {path: 'Payment', component: PaymentComponent},
  {path: 'Help', component: HelpComponent},
  {path: 'Help/Support', component: SupportComponent},
  {path: 'Feedback', component: FeedbackComponent},
  {path: 'History', component: BillhistoryComponent},
  {path:'Feedback',component: FeedbackComponent },
  {path:'AdminLogin',component: AdminLoginComponent },
  {path:'AdminDashboard',component: AdminDashboardComponent },
  {path:'AdminCustomerDetails',component: AdminCustomerDetailsComponent },
  {path:'AdminCustomerUpdate/:mobileno',component: AdminCustomerUpdateComponent },
  {path:'AdminBill',component: AdminBillComponent },
  {path:'AdminComplaint',component: AdminComplaintComponent },
  {path:'AdminComplaintRespond/:id',component: AdminComplaintRespondComponent },
  {path:'AdminProfile',component: AdminProfileComponent },
  {path:'**',component: NotfoundComponent }
  
];
 
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
