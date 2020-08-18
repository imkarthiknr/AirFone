import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCustomerUpdateComponent } from './admin-customer-update.component';

describe('AdminCustomerUpdateComponent', () => {
  let component: AdminCustomerUpdateComponent;
  let fixture: ComponentFixture<AdminCustomerUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCustomerUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCustomerUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
