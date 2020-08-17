import { TestBed } from '@angular/core/testing';

import { AdminprofileService } from './adminprofile.service';

describe('AdminprofileService', () => {
  let service: AdminprofileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminprofileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
