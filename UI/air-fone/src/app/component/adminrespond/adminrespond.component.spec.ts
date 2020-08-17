import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminrespondComponent } from './adminrespond.component';

describe('AdminrespondComponent', () => {
  let component: AdminrespondComponent;
  let fixture: ComponentFixture<AdminrespondComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminrespondComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminrespondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
