import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {
  prepaid1:string = "19";
  prepaid2:string = "99";
  prepaid3:string = "129";
  prepaid4:string = "149";
  prepaid5:string = "149";
  prepaid6:string = "199";
  prepaid7:string = "219";
  prepaid8:string = "249";
  prepaid9:string = "279";
  prepaid10:string = "298";
  prepaid11:string = "349";
  prepaid12:string = "379";
  prepaid13:string = "398";
  prepaid14:string = "399";
  prepaid15:string = "449";
  prepaid16:string = "558";

  postpaid1:string = "749";
  postpaid2:string = "999";
  postpaid3:string = "1099";
  postpaid4:string = "210";
  postpaid5:string = "300";
  postpaid6:string = "400";
  postpaid7:string = "400";
  postpaid8:string = "550";

  broadband1:string = "1075";
  broadband2:string = "1999";
  broadband3:string = "2999";
  broadband4:string = "777";
  broadband5:string = "1055";
  broadband6:string = "3999";

  plan1:string = "prepaid";
  plan2:string = "postpaid";
  plan3:string = "broadband";

  constructor(private router : Router) { 
  }

  ngOnInit(): void {
  }

  PrepaidButton1()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid1}});
  }
  PrepaidButton2()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid2}});
  }
  PrepaidButton3()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid3}});
  }
  PrepaidButton4()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid4}});
  }
  PrepaidButton5()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid5}});
  }
  PrepaidButton6()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid6}});
  }
  PrepaidButton7()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid7}});
  }
  PrepaidButton8()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid8}});
  }
  PrepaidButton9()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid9}});
  }
  PrepaidButton10()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid10}});
  }
  PrepaidButton11()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid11}});
  }
  PrepaidButton12()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid12}});
  }
  PrepaidButton13()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid13}});
  }
  PrepaidButton14()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid14}});
  }
  PrepaidButton15()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid15}});
  }
  PrepaidButton16()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan1,planamount:this.prepaid16}});
  }


  PostpaidButton1()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan2,planamount:this.postpaid1}});
  }
  PostpaidButton2()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan2,planamount:this.postpaid2}});
  }
  PostpaidButton3()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan2,planamount:this.postpaid3}});
  }
  PostpaidButton4()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan2,planamount:this.postpaid4}});
  }
  PostpaidButton5()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan2,planamount:this.postpaid5}});
  }
  PostpaidButton6()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan2,planamount:this.postpaid6}});
  }
  PostpaidButton7()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan2,planamount:this.postpaid7}});
  }
  PostpaidButton8()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan2,planamount:this.postpaid8}});
  }


  BroadbandButton1()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan3,planamount:this.broadband1}});
  }
  BroadbandButton2()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan3,planamount:this.broadband1}});
  }
  BroadbandButton3()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan3,planamount:this.broadband1}});
  }
  BroadbandButton4()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan3,planamount:this.broadband1}});
  }
  BroadbandButton5()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan3,planamount:this.broadband1}});
  }
  BroadbandButton6()
  {
    this.router.navigate(['/Bill'],{queryParams:{plan:this.plan3,planamount:this.broadband1}});
  }

}
