import { TestBed } from '@angular/core/testing';

import { CustomerbillService } from './customerbill.service';

describe('CustomerbillService', () => {
  let service: CustomerbillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerbillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
