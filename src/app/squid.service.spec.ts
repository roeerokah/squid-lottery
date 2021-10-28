import { TestBed } from '@angular/core/testing';

import { SquidService } from './squid.service';

describe('SquidService', () => {
  let service: SquidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SquidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
