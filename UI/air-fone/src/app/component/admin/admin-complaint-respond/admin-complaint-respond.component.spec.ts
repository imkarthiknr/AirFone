import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComplaintRespondComponent } from './admin-complaint-respond.component';

describe('AdminComplaintRespondComponent', () => {
  let component: AdminComplaintRespondComponent;
  let fixture: ComponentFixture<AdminComplaintRespondComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminComplaintRespondComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComplaintRespondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
