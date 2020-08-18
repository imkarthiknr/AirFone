import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerbillhistoryComponent } from './customerbillhistory.component';

describe('CustomerbillhistoryComponent', () => {
  let component: CustomerbillhistoryComponent;
  let fixture: ComponentFixture<CustomerbillhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerbillhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerbillhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
