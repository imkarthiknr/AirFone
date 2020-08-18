import { TestBed } from '@angular/core/testing';

import { AdmingetsingleuserService } from './admingetsingleuser.service';

describe('AdmingetsingleuserService', () => {
  let service: AdmingetsingleuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdmingetsingleuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
