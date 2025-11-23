import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestTypePageComponent } from './test-type-page.component';

describe('TestTypePageComponent', () => {
  let component: TestTypePageComponent;
  let fixture: ComponentFixture<TestTypePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTypePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestTypePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
