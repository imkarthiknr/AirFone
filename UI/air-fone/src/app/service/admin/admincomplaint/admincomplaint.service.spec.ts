import { TestBed } from '@angular/core/testing';

import { AdmincomplaintService } from './admincomplaint.service';

describe('AdmincomplaintService', () => {
  let service: AdmincomplaintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdmincomplaintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
