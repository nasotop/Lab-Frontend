import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderPageComponent } from './order-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Servicios
import { OrderService } from '../service/order.service';
import { PatientService } from '../../patient/service/patient.service';
import { ParameterService } from '../../parameter/service/parameter.service';
import { AuthService } from '../../../features/auth/services/auth.service';

// Importar componentes reales para el override
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
class MockOrderService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ data: [], success: true }));
  create = jasmine.createSpy('create').and.returnValue(of({ success: true }));
  update = jasmine.createSpy('update').and.returnValue(of({ success: true }));
  delete = jasmine.createSpy('delete').and.returnValue(of({ success: true }));
}

class MockPatientService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ 
    data: [{ id: 1, fullName: 'John Doe' }], 
    success: true 
  }));
}

class MockParameterService {
  getOrderStatus = jasmine.createSpy('getOrderStatus').and.returnValue(of({ 
    data: [
      { value: 1, description: 'PENDIENTE' },
      { value: 2, description: 'COMPLETADO' }
    ], 
    success: true 
  }));
}

class MockAuthService {
  validateToken = jasmine.createSpy('validateToken').and.returnValue(of({ role: 'ADMIN' }));
}

describe('OrderPageComponent', () => {
  let component: OrderPageComponent;
  let fixture: ComponentFixture<OrderPageComponent>;
  
  // Referencias a mocks
  let orderService: MockOrderService;
  let patientService: MockPatientService;
  let parameterService: MockParameterService;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPageComponent, ReactiveFormsModule],
      providers: [
        { provide: OrderService, useClass: MockOrderService },
        { provide: PatientService, useClass: MockPatientService },
        { provide: ParameterService, useClass: MockParameterService },
        { provide: AuthService, useClass: MockAuthService },
      ]
    })
    .overrideComponent(OrderPageComponent, {
      remove: { imports: [EntityTableComponent, FullScreenFormComponent] },
      add: { imports: [MockEntityTableComponent, MockFullScreenFormComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPageComponent);
    component = fixture.componentInstance;
    
    orderService = TestBed.inject(OrderService) as unknown as MockOrderService;
    patientService = TestBed.inject(PatientService) as unknown as MockPatientService;
    parameterService = TestBed.inject(ParameterService) as unknown as MockParameterService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  // --- 1. Inicialización ---

  it('debería crear el componente e inicializar datos', () => {
    fixture.detectChanges(); // Ejecuta ngOnInit

    expect(component).toBeTruthy();
    expect(authService.validateToken).toHaveBeenCalled();
    expect(patientService.getAll).toHaveBeenCalled();
    expect(parameterService.getOrderStatus).toHaveBeenCalled();
    expect(orderService.getAll).toHaveBeenCalled();

    // Verificar que los signals se llenaron
    expect(component.patients().length).toBe(1);
    expect(component.statuses().length).toBe(2);
    expect(component.fields().length).toBeGreaterThan(0);
  });

  it('debería ser admin si el token tiene rol ADMIN', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    expect(component.isAdmin()).toBeTrue();
  });

  it('no debería ser admin si el token tiene rol USER', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();
    expect(component.isAdmin()).toBeFalse();
  });

  // --- 2. Acciones UI (Admin) ---

  it('startCreate debería reiniciar el formulario y mostrarlo', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    
    // Ensuciar formulario
    component.form.patchValue({ notes: 'Old Notes' });
    
    component.startCreate();

    expect(component.isEditing()).toBeFalse();
    expect(component.editingId()).toBeNull();
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.notes).toBeFalsy(); 
  });

  it('startCreate no debería hacer nada si no es admin', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();
    
    component.startCreate();
    expect(component.showForm()).toBeFalse();
  });

  it('onEdit debería cargar datos y mostrar formulario', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    const mockRow = {
      id: 123,
      patient: { id: 1 },
      status: 'PENDIENTE',
      notes: 'Test Note',
      orderedAt: '2023-10-10T10:00:00'
    };

    component.onEdit(mockRow);

    expect(component.isEditing()).toBeTrue();
    expect(component.editingId()).toBe(123);
    expect(component.showForm()).toBeTrue();
    
    // Verificar patchValue (la fecha se recorta en la lógica del componente)
    expect(component.form.get('notes')?.value).toBe('Test Note');
    expect(component.form.get('orderedAt')?.value).toBe('2023-10-10');
  });

  it('onDelete debería llamar al servicio delete', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.onDelete(55);

    expect(orderService.delete).toHaveBeenCalledWith(55);
    expect(orderService.getAll).toHaveBeenCalledTimes(2); // 1 en init, 1 tras delete
  });

  // --- 3. Guardado (Save) ---

  it('save (Create) debería construir el DTO correctamente y llamar a create', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    
    component.isEditing.set(false);

    // Seleccionamos status '1' que corresponde a 'PENDIENTE' en el mock
    component.form.setValue({
      patientId: '1',
      status: '1', 
      notes: 'New Order',
      orderedAt: '2023-12-01'
    });

    component.save();

    expect(component.loading()).toBeTrue();
    expect(orderService.create).toHaveBeenCalled();

    // Verificación profunda del DTO generado
    const expectedDto = jasmine.objectContaining({
      patient: { id: 1 },
      status: 'PENDIENTE', // El componente busca el description basado en el value
      orderedAt: '2023-12-01T00:00:00',
      notes: 'New Order'
    });
    
    expect(orderService.create).toHaveBeenCalledWith(expectedDto);
    expect(component.showForm()).toBeFalse();
  });

  it('save (Update) debería llamar a update con el ID correcto', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(true);
    component.editingId.set(999);

    component.form.setValue({
      patientId: '1',
      status: '2', // COMPLETADO
      notes: 'Updated Note',
      orderedAt: '2023-12-01'
    });

    component.save();

    expect(orderService.update).toHaveBeenCalled();
    const dto = orderService.update.calls.mostRecent().args[0];
    
    expect(dto.id).toBe(999);
    expect(dto.status).toBe('COMPLETADO');
  });

  it('save no debería ejecutarse si el formulario es inválido', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.reset(); // Inválido
    component.save();

    expect(orderService.create).not.toHaveBeenCalled();
    expect(orderService.update).not.toHaveBeenCalled();
  });

  it('save debería manejar error del servicio', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.setValue({
      patientId: '1',
      status: '1',
      notes: 'Test',
      orderedAt: '2023-01-01'
    });

    orderService.create.and.returnValue(throwError(() => 'Error'));

    component.save();

    expect(component.loading()).toBeFalse();
    expect(component.showForm()).toBeTrue(); // No cierra el form
  });

  it('closeForm debería ocultar el formulario', () => {
    component.showForm.set(true);
    component.closeForm();
    expect(component.showForm()).toBeFalse();
  });
});