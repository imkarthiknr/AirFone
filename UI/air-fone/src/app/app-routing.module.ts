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
  {path:'**',component: NotfoundComponent }
];
 
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
