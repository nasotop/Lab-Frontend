import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TestTypePageComponent } from './test-type-page.component';
import { TestTypeService } from '../service/test-type.service';
import { ParameterService } from '../../parameter/service/parameter.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EntityTableComponent } from '../../../shared/component/entity-table.component';
import { FullScreenFormComponent } from '../../../shared/component/full-screen-form.component';
@Component({
  selector: 'app-entity-table',
  standalone: true,
  template: '',
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
  template: '',
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

class MockTestTypeService {
  getAll = jasmine
    .createSpy('getAll')
    .and.returnValue(of({ data: [], success: true }));
  create = jasmine
    .createSpy('create')
    .and.returnValue(of({ data: {}, success: true }));
  update = jasmine
    .createSpy('update')
    .and.returnValue(of({ data: {}, success: true }));
  delete = jasmine.createSpy('delete').and.returnValue(of({ success: true }));
}

class MockParameterService {
  getSpecializations = jasmine.createSpy('getSpecializations').and.returnValue(
    of({
      data: [{ value: 1, description: 'Hematology' }],
      success: true,
    })
  );
}

class MockAuthService {
  validateToken = jasmine
    .createSpy('validateToken')
    .and.returnValue(of({ role: 'ADMIN' }));
}

describe('TestTypePageComponent', () => {
  let component: TestTypePageComponent;
  let fixture: ComponentFixture<TestTypePageComponent>;
  let testTypeService: MockTestTypeService;
  let paramService: MockParameterService;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTypePageComponent, ReactiveFormsModule],
      providers: [
        { provide: TestTypeService, useClass: MockTestTypeService },
        { provide: ParameterService, useClass: MockParameterService },
        { provide: AuthService, useClass: MockAuthService },
      ],
    })
      .overrideComponent(TestTypePageComponent, {
        remove: { imports: [EntityTableComponent, FullScreenFormComponent] },
        add: {
          imports: [MockEntityTableComponent, MockFullScreenFormComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TestTypePageComponent);
    component = fixture.componentInstance;
    testTypeService = TestBed.inject(
      TestTypeService
    ) as unknown as MockTestTypeService;
    paramService = TestBed.inject(
      ParameterService
    ) as unknown as MockParameterService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  it('should create and initialize data', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(authService.validateToken).toHaveBeenCalled();
    expect(paramService.getSpecializations).toHaveBeenCalled();
    expect(testTypeService.getAll).toHaveBeenCalled();
    expect(component.specializations().length).toBe(1);
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

  it('should set isAdmin to false on auth error', () => {
    authService.validateToken.and.returnValue(
      throwError(() => new Error('Error'))
    );
    fixture.detectChanges();
    expect(component.isAdmin()).toBeFalse();
  });

  it('startCreate should reset form and show it', () => {
    fixture.detectChanges();
    component.isAdmin.set(true);

    component.form.patchValue({ name: 'Old' });
    component.startCreate();

    expect(component.isEditing()).toBeFalse();
    expect(component.editingId()).toBeNull();
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.name).toBeNull();
  });

  it('startCreate should do nothing if not admin', () => {
    fixture.detectChanges();
    component.isAdmin.set(false);
    component.showForm.set(false);

    component.startCreate();
    expect(component.showForm()).toBeFalse();
  });

  it('onEdit should populate form and show it', () => {
    fixture.detectChanges();
    component.isAdmin.set(true);
    const mockRow = {
      id: 10,
      name: 'Test',
      code: 'T1',
      specialization: 'S1',
      sampleType: 'B1',
    };

    component.onEdit(mockRow);

    expect(component.isEditing()).toBeTrue();
    expect(component.editingId()).toBe(10);
    expect(component.form.value.name).toBe('Test');
    expect(component.showForm()).toBeTrue();
  });

  it('closeForm should hide the form', () => {
    component.showForm.set(true);
    component.closeForm();
    expect(component.showForm()).toBeFalse();
  });

  it('save should call create when not editing', () => {
    fixture.detectChanges();
    component.isAdmin.set(true);
    component.isEditing.set(false);
    component.editingId.set(null);

    component.form.setValue({
      name: 'New Test',
      code: 'NT',
      specialization: 'Hematology',
      sampleType: 'Blood',
    });

    component.save();

    expect(testTypeService.create).toHaveBeenCalled();
    expect(component.showForm()).toBeFalse();
  });

  it('save should call update when editing', () => {
    fixture.detectChanges();
    component.isAdmin.set(true);
    component.isEditing.set(true);
    component.editingId.set(55);

    component.form.setValue({
      name: 'Update Test',
      code: 'UT',
      specialization: 'Hematology',
      sampleType: 'Plasma',
    });

    component.save();

    expect(testTypeService.update).toHaveBeenCalledWith(
      55,
      jasmine.objectContaining({ name: 'Update Test' })
    );
    expect(component.showForm()).toBeFalse();
  });

  it('save should not proceed if form is invalid', () => {
    fixture.detectChanges();
    component.isAdmin.set(true);
    component.form.setValue({
      name: '',
      code: '',
      specialization: '',
      sampleType: '',
    });

    component.save();

    expect(testTypeService.create).not.toHaveBeenCalled();
    expect(testTypeService.update).not.toHaveBeenCalled();
  });

  it('onDelete should call delete service', () => {
    fixture.detectChanges();
    component.isAdmin.set(true);

    component.onDelete(123);

    expect(testTypeService.delete).toHaveBeenCalledWith(123);
    expect(testTypeService.getAll).toHaveBeenCalledTimes(2);
  });

  it('onDelete should do nothing if not admin', () => {
    fixture.detectChanges();
    component.isAdmin.set(false);

    component.onDelete(123);

    expect(testTypeService.delete).not.toHaveBeenCalled();
  });

  it('should handle loading error in load()', () => {
    testTypeService.getAll.and.returnValue(throwError(() => 'Error'));
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
  });

  it('should handle error in save()', () => {
    fixture.detectChanges();
    component.isAdmin.set(true);
    component.form.setValue({
      name: 'Test',
      code: 'T',
      specialization: 'S',
      sampleType: 'ST',
    });
    testTypeService.create.and.returnValue(throwError(() => 'Error'));

    component.save();

    expect(component.loading()).toBeFalse();
    expect(component.showForm()).toBeTrue();
  });
});
