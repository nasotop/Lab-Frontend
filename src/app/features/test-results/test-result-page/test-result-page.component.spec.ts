import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TestResultPageComponent } from './test-result-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { TestResultsService } from '../service/test-results.service';
import { OrderTestService } from '../../order-test/service/order-test.service';
import { AuthService } from '../../../features/auth/services/auth.service';

import { EntityTableComponent } from '../../../shared/component/entity-table.component';
import { FullScreenFormComponent } from '../../../shared/component/full-screen-form.component';

@Component({
  selector: 'app-entity-table',
  standalone: true,
  template: ''
})
class MockEntityTableComponent {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() showActions = false;
  @Input() idKey = 'id';
  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<number>();
}

@Component({
  selector: 'app-fullscreen-form',
  standalone: true,
  template: ''
})
class MockFullScreenFormComponent {
  @Input() title = '';
  @Input() form: any;
  @Input() fields: any[] = [];
  @Input() disabled = false;
  @Input() submitLabel = '';
  @Output() submitted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
}

class MockTestResultsService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ data: [], success: true }));
  create = jasmine.createSpy('create').and.returnValue(of({ data: {}, success: true }));
  update = jasmine.createSpy('update').and.returnValue(of({ data: {}, success: true }));
  delete = jasmine.createSpy('delete').and.returnValue(of({ success: true }));
  getTestStatuses = jasmine.createSpy('getTestStatuses').and.returnValue(of({ data: ['PENDING', 'COMPLETED'], success: true }));
}

class MockOrderTestService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ data: [{ id: 101 }, { id: 102 }], success: true }));
}

class MockAuthService {
  validateToken = jasmine.createSpy('validateToken').and.returnValue(of({ role: 'ADMIN' }));
}

describe('TestResultPageComponent', () => {
  let component: TestResultPageComponent;
  let fixture: ComponentFixture<TestResultPageComponent>;
  let testResultsService: MockTestResultsService;
  let orderTestService: MockOrderTestService;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestResultPageComponent, ReactiveFormsModule],
      providers: [
        { provide: TestResultsService, useClass: MockTestResultsService },
        { provide: OrderTestService, useClass: MockOrderTestService },
        { provide: AuthService, useClass: MockAuthService },
      ]
    })
    .overrideComponent(TestResultPageComponent, {
      remove: { imports: [EntityTableComponent, FullScreenFormComponent] },
      add: { imports: [MockEntityTableComponent, MockFullScreenFormComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestResultPageComponent);
    component = fixture.componentInstance;
    testResultsService = TestBed.inject(TestResultsService) as unknown as MockTestResultsService;
    orderTestService = TestBed.inject(OrderTestService) as unknown as MockOrderTestService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  it('should create and initialize data', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(authService.validateToken).toHaveBeenCalled();
    expect(testResultsService.getAll).toHaveBeenCalled();
    expect(orderTestService.getAll).toHaveBeenCalled();
    expect(testResultsService.getTestStatuses).toHaveBeenCalled();
    
    expect(component.statuses().length).toBe(2);
    expect(component.orderTests().length).toBe(2);
    expect(component.fields().length).toBeGreaterThan(0);
  });

  it('should set isAdmin to true if token validation returns ADMIN role', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    expect(component.isAdmin()).toBeTrue();
  });

  it('should set isAdmin to false if token validation returns USER role', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();
    expect(component.isAdmin()).toBeFalse();
  });

  it('startCreate should reset form and show it', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    
    component.form.patchValue({ value: 'Old Value' });
    component.startCreate();

    expect(component.isEditing()).toBeFalse();
    expect(component.editingId()).toBeNull();
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.value).toBeFalsy(); 
  });

  it('startCreate should do nothing if not admin', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();
    
    component.startCreate();
    expect(component.showForm()).toBeFalse();
  });

  it('onEdit should populate form and show it', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    const mockRow = { 
      id: 55, 
      orderTestId: 101, 
      value: '10.5', 
      unit: 'g/dL', 
      referenceRange: '10-20', 
      interpretation: 'Normal', 
      status: 'COMPLETED' 
    };

    component.onEdit(mockRow);

    expect(component.isEditing()).toBeTrue();
    expect(component.editingId()).toBe(55);
    expect(component.form.get('value')?.value).toBe('10.5');
    expect(component.showForm()).toBeTrue();
  });

  it('onDelete should call delete service if admin', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.onDelete(99);

    expect(testResultsService.delete).toHaveBeenCalledWith(99);
    expect(testResultsService.getAll).toHaveBeenCalledTimes(2);
  });

  it('closeForm should hide the form', () => {
    component.showForm.set(true);
    component.closeForm();
    expect(component.showForm()).toBeFalse();
    expect(component.editingId()).toBeNull();
  });

  it('save should call create when not editing', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(false);
    
    component.form.setValue({
      orderTestId: '101',
      value: '50',
      unit: 'mg',
      referenceRange: '0-100',
      interpretation: 'Normal',
      status: 'PENDING'
    });

    component.save();

    expect(component.loading()).toBeTrue();
    expect(testResultsService.create).toHaveBeenCalled();
    
    const args = testResultsService.create.calls.mostRecent().args[0];
    expect(args.orderTestId).toBe(101);
    expect(args.value).toBe('50');
    expect(component.showForm()).toBeFalse();
  });

  it('save should call update when editing', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(true);
    component.editingId.set(77);

    component.form.setValue({
      orderTestId: '102',
      value: '200',
      unit: 'mg',
      referenceRange: '0-100',
      interpretation: 'High',
      status: 'COMPLETED'
    });

    component.save();

    expect(testResultsService.update).toHaveBeenCalledWith(77, jasmine.objectContaining({
      orderTestId: 102,
      value: '200'
    }));
    expect(component.showForm()).toBeFalse();
  });

  it('save should not proceed if form is invalid', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.reset(); 
    component.save();

    expect(testResultsService.create).not.toHaveBeenCalled();
    expect(testResultsService.update).not.toHaveBeenCalled();
  });

  it('save should handle service errors', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(false);
    component.form.setValue({
      orderTestId: '101', value: '1', unit: 'u', referenceRange: 'r', interpretation: 'i', status: 's'
    });

    testResultsService.create.and.returnValue(throwError(() => 'Error'));

    component.save();

    expect(component.loading()).toBeFalse();
    expect(component.showForm()).toBeTrue();
  });

  it('load should handle service errors', () => {
    testResultsService.getAll.and.returnValue(throwError(() => 'Error'));
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.results()).toEqual([]);
  });
});