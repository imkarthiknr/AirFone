import { TestBed } from '@angular/core/testing';

import { AdmingetuserService } from './admingetuser.service';

describe('AdmingetuserService', () => {
  let service: AdmingetuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdmingetuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
