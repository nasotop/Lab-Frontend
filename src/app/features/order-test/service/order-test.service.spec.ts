import { TestBed } from '@angular/core/testing';

import { OrderTestService } from './order-test.service';

describe('OrderTestService', () => {
  let service: OrderTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
