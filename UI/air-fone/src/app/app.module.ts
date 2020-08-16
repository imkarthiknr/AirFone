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
    CustDetailComponent, BillComponent
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
  bootstrap: [AppComponent,HomeComponent]
})
export class AppModule { }
