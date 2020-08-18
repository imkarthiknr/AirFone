import { TestBed } from '@angular/core/testing';

import { AdminbillService } from './adminbill.service';

describe('AdminbillService', () => {
  let service: AdminbillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminbillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
