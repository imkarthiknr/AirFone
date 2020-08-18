import { TestBed } from '@angular/core/testing';

import { PaymentstoreService } from './paymentstore.service';

describe('PaymentstoreService', () => {
  let service: PaymentstoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentstoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
