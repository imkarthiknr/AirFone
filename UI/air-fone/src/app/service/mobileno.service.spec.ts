import { TestBed } from '@angular/core/testing';

import { MobilenoService } from './mobileno.service';

describe('MobilenoService', () => {
  let service: MobilenoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobilenoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
