import { TestBed } from '@angular/core/testing';

import { GetsingleuserService } from './getsingleuser.service';

describe('GetsingleuserService', () => {
  let service: GetsingleuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetsingleuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
