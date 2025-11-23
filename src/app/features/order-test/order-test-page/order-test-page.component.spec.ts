import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTestPageComponent } from './order-test-page.component';

describe('OrderTestPageComponent', () => {
  let component: OrderTestPageComponent;
  let fixture: ComponentFixture<OrderTestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTestPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
