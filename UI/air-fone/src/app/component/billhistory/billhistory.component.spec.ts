import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillhistoryComponent } from './billhistory.component';

describe('BillhistoryComponent', () => {
  let component: BillhistoryComponent;
  let fixture: ComponentFixture<BillhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
