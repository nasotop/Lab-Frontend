import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LaboratoryPageComponent } from './laboratory-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { LaboratoryService } from '../service/laboratory.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ParameterService } from '../../parameter/service/parameter.service';

// Importar componentes reales para poder eliminarlos en el override
import { EntityTableComponent } from '../../../shared/component/entity-table.component';
import { FullScreenFormComponent } from '../../../shared/component/full-screen-form.component';

// --- Mocks de Componentes Hijos ---
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

// --- Mocks de Servicios ---
class MockLaboratoryService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ data: [], success: true }));
  create = jasmine.createSpy('create').and.returnValue(of({ success: true }));
  update = jasmine.createSpy('update').and.returnValue(of({ success: true }));
  delete = jasmine.createSpy('delete').and.returnValue(of({ success: true }));
}

class MockAuthService {
  validateToken = jasmine.createSpy('validateToken').and.returnValue(of({ role: 'ADMIN' }));
}

class MockParameterService {
  getSpecializations = jasmine.createSpy('getSpecializations').and.returnValue(of({ 
    data: [{ value: 1, description: 'Hematology' }], 
    success: true 
  }));
}

describe('LaboratoryPageComponent', () => {
  let component: LaboratoryPageComponent;
  let fixture: ComponentFixture<LaboratoryPageComponent>;
  
  let labService: MockLaboratoryService;
  let authService: MockAuthService;
  let paramService: MockParameterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryPageComponent, ReactiveFormsModule],
      providers: [
        { provide: LaboratoryService, useClass: MockLaboratoryService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: ParameterService, useClass: MockParameterService },
      ]
    })
    .overrideComponent(LaboratoryPageComponent, {
      remove: { imports: [EntityTableComponent, FullScreenFormComponent] },
      add: { imports: [MockEntityTableComponent, MockFullScreenFormComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryPageComponent);
    component = fixture.componentInstance;
    
    labService = TestBed.inject(LaboratoryService) as unknown as MockLaboratoryService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    paramService = TestBed.inject(ParameterService) as unknown as MockParameterService;
  });

  // --- 1. Inicialización ---

  it('debería crear el componente e inicializar datos', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(authService.validateToken).toHaveBeenCalled();
    expect(paramService.getSpecializations).toHaveBeenCalled();
    expect(labService.getAll).toHaveBeenCalled();
    
    expect(component.specializations().length).toBe(1);
    expect(component.fields().length).toBeGreaterThan(0);
  });

  it('debería establecer isAdmin en true si el rol es ADMIN', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    expect(component.isAdmin()).toBeTrue();
  });

  it('debería establecer isAdmin en false si el rol no es ADMIN', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();
    expect(component.isAdmin()).toBeFalse();
  });

  // --- 2. Acciones UI (Admin) ---

  it('startCreate debería reiniciar el formulario y mostrarlo', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    
    component.form.patchValue({ name: 'Old Lab' });
    
    component.startCreate();

    expect(component.isEditing()).toBeFalse();
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.name).toBeFalsy();
  });

  it('startCreate no debería hacer nada si no es admin', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();
    
    component.startCreate();
    expect(component.showForm()).toBeFalse();
  });

  it('onEdit debería poblar el formulario y establecer modo edición', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    const mockRow = {
      id: 10,
      name: 'Lab Central',
      location: 'Building A',
      capacity: '500',
      specialization: 'General'
    };

    component.onEdit(mockRow);

    expect(component.isEditing()).toBeTrue();
    expect(component.editingId()).toBe(10);
    expect(component.showForm()).toBeTrue();
    expect(component.form.get('name')?.value).toBe('Lab Central');
  });

  it('onDelete debería llamar al servicio delete y recargar', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.onDelete(55);

    expect(labService.delete).toHaveBeenCalledWith(55);
    expect(labService.getAll).toHaveBeenCalledTimes(2); // Init + Delete reload
  });

  // --- 3. Guardado (Save) ---

  it('save (Create) debería llamar a create con el payload correcto', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(false);
    
    component.form.setValue({
      name: 'New Lab',
      location: 'City Center',
      capacity: '100', // String en el form
      specialization: 'Hematology'
    });

    component.save();

    expect(component.loading()).toBeTrue();
    expect(labService.create).toHaveBeenCalled();

    const expectedDto = jasmine.objectContaining({
      name: 'New Lab',
      location: 'City Center',
      capacity: 100, // Debe haberse convertido a número
      specialization: 'Hematology'
    });

    expect(labService.create).toHaveBeenCalledWith(expectedDto);
    expect(component.showForm()).toBeFalse();
  });

  it('save (Update) debería llamar a update con el payload correcto', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(true);
    component.editingId.set(99);

    component.form.setValue({
      name: 'Updated Lab',
      location: 'West Wing',
      capacity: '200',
      specialization: 'Chemistry'
    });

    component.save();

    expect(labService.update).toHaveBeenCalled();
    const payload = labService.update.calls.mostRecent().args[0];

    expect(payload.id).toBe(99);
    expect(payload.name).toBe('Updated Lab');
    expect(payload.capacity).toBe(200);
    
    expect(component.showForm()).toBeFalse();
    expect(component.editingId()).toBeNull();
  });

  it('save no debería ejecutarse si el formulario es inválido', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.reset(); // Inválido
    component.save();

    expect(labService.create).not.toHaveBeenCalled();
    expect(labService.update).not.toHaveBeenCalled();
  });

  it('save debería manejar errores del servicio', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.setValue({
      name: 'Lab Error',
      location: 'Nowhere',
      capacity: '10',
      specialization: 'Error'
    });

    labService.create.and.returnValue(throwError(() => 'Error'));

    component.save();

    expect(component.loading()).toBeFalse();
    expect(component.showForm()).toBeTrue(); // Formulario permanece abierto
  });

  it('closeForm debería ocultar el formulario', () => {
    component.showForm.set(true);
    component.closeForm();
    expect(component.showForm()).toBeFalse();
  });
});