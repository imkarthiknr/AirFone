import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmincomplaintdetailsComponent } from './admincomplaintdetails.component';

describe('AdmincomplaintdetailsComponent', () => {
  let component: AdmincomplaintdetailsComponent;
  let fixture: ComponentFixture<AdmincomplaintdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdmincomplaintdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmincomplaintdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
