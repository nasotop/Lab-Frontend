import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderTestPageComponent } from './order-test-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Servicios
import { OrderTestService } from '../service/order-test.service';
import { OrderService } from '../../order/service/order.service';
import { LaboratoryService } from '../../laboratory/service/laboratory.service';
import { TestTypeService } from '../../test-type/service/test-type.service';
import { ParameterService } from '../../parameter/service/parameter.service';
import { AuthService } from '../../../features/auth/services/auth.service';

// 1. Mocks de Componentes Hijos (Standalone)
// Importamos los reales para usar en el override (aunque no se usen en runtime en el test)
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

// 2. Mocks de Servicios
class MockOrderTestService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ data: [], success: true }));
  create = jasmine.createSpy('create').and.returnValue(of({ data: {}, success: true }));
  update = jasmine.createSpy('update').and.returnValue(of({ data: {}, success: true }));
  delete = jasmine.createSpy('delete').and.returnValue(of({ success: true }));
}

class MockGenericService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ data: [], success: true }));
}

class MockParameterService {
  getPriorities = jasmine.createSpy('getPriorities').and.returnValue(of({ data: [{ description: 'Alta' }], success: true }));
  getTestStatus = jasmine.createSpy('getTestStatus').and.returnValue(of({ data: [{ description: 'Pendiente' }], success: true }));
}

class MockAuthService {
  validateToken = jasmine.createSpy('validateToken').and.returnValue(of({ role: 'ADMIN' }));
}

describe('OrderTestPageComponent', () => {
  let component: OrderTestPageComponent;
  let fixture: ComponentFixture<OrderTestPageComponent>;
  
  // Referencias a los mocks
  let orderTestService: MockOrderTestService;
  let orderService: MockGenericService;
  let labService: MockGenericService;
  let testTypeService: MockGenericService;
  let parameterService: MockParameterService;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTestPageComponent, ReactiveFormsModule],
      providers: [
        { provide: OrderTestService, useClass: MockOrderTestService },
        { provide: OrderService, useClass: MockGenericService },
        { provide: LaboratoryService, useClass: MockGenericService },
        { provide: TestTypeService, useClass: MockGenericService },
        { provide: ParameterService, useClass: MockParameterService },
        { provide: AuthService, useClass: MockAuthService },
      ]
    })
    .overrideComponent(OrderTestPageComponent, {
      remove: { imports: [EntityTableComponent, FullScreenFormComponent] },
      add: { imports: [MockEntityTableComponent, MockFullScreenFormComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTestPageComponent);
    component = fixture.componentInstance;

    // Inyectar servicios para controlarlos
    orderTestService = TestBed.inject(OrderTestService) as unknown as MockOrderTestService;
    orderService = TestBed.inject(OrderService) as unknown as MockGenericService;
    labService = TestBed.inject(LaboratoryService) as unknown as MockGenericService;
    testTypeService = TestBed.inject(TestTypeService) as unknown as MockGenericService;
    parameterService = TestBed.inject(ParameterService) as unknown as MockParameterService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  // --- 1. Inicialización ---
  it('debería crear el componente e inicializar datos', () => {
    // Configurar respuestas simuladas para los catálogos
    orderService.getAll.and.returnValue(of({ data: [{ id: 1, patient: { fullName: 'Pepe' } }], success: true }));
    labService.getAll.and.returnValue(of({ data: [{ id: 1, name: 'Lab1' }], success: true }));
    testTypeService.getAll.and.returnValue(of({ data: [{ id: 1, name: 'Hemo' }], success: true }));

    fixture.detectChanges(); // Ejecuta ngOnInit

    expect(component).toBeTruthy();
    expect(authService.validateToken).toHaveBeenCalled();
    expect(orderTestService.getAll).toHaveBeenCalled();
    
    // Verificar carga de catálogos
    expect(orderService.getAll).toHaveBeenCalled();
    expect(labService.getAll).toHaveBeenCalled();
    expect(testTypeService.getAll).toHaveBeenCalled();
    expect(parameterService.getPriorities).toHaveBeenCalled();
    expect(parameterService.getTestStatus).toHaveBeenCalled();

    // Verificar que los signals se actualizaron
    expect(component.orders().length).toBe(1);
    expect(component.labs().length).toBe(1);
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

  // --- 2. Interacción CRUD (Admin) ---

  it('startCreate debería reiniciar el formulario y mostrarlo', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    
    // Simular que el form estaba sucio
    component.form.patchValue({ priority: 'Alta' });
    
    component.startCreate();

    expect(component.isEditing()).toBeFalse();
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.priority).toBeFalsy(); // Reseteado
  });

  it('startCreate no debería hacer nada si no es admin', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();
    
    component.startCreate();
    expect(component.showForm()).toBeFalse();
  });

  it('onEdit debería poblar el formulario y marcar edición', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    const mockRow = {
      order: { id: 100 },
      testType: { id: 200 },
      laboratory: { id: 300 },
      priority: 'Alta',
      status: 'Pendiente',
      scheduledStart: '2023-01-01',
      scheduledEnd: '2023-01-02'
    };

    component.onEdit(mockRow);

    expect(component.isEditing()).toBeTrue();
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.priority).toBe('Alta');
    expect(component.form.value.orderId).toBe('100');
  });

  it('onDelete debería llamar al servicio delete si es admin', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.onDelete(123);

    expect(orderTestService.delete).toHaveBeenCalledWith(123);
    // Verificar recarga
    expect(orderTestService.getAll).toHaveBeenCalledTimes(2); 
  });

  it('closeForm debería ocultar el formulario', () => {
    component.showForm.set(true);
    component.closeForm();
    expect(component.showForm()).toBeFalse();
  });

  // --- 3. Guardado (Save) ---

  it('save (Create) debería llamar al servicio create con el DTO correcto', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(false);
    
    // Llenar formulario válido
    component.form.setValue({
      orderId: '10',
      testTypeId: '20',
      laboratoryId: '30',
      priority: 'Alta',
      status: 'Pendiente',
      scheduledStart: '2023-01-01T10:00',
      scheduledEnd: '2023-01-01T11:00'
    });

    component.save();

    expect(component.loading()).toBeTrue();
    expect(orderTestService.create).toHaveBeenCalled();
    
    const expectedDto = jasmine.objectContaining({
      orderId: 10,
      testTypeId: 20,
      priority: 'Alta'
    });
    expect(orderTestService.create).toHaveBeenCalledWith(expectedDto);
    
    // Verificar post-guardado
    expect(component.showForm()).toBeFalse();
  });

  it('save (Update) debería llamar al servicio update', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(true);
    
    // Simular que venimos de una edición donde el ID no está en el controls del form,
    // pero el componente intenta leerlo de `this.form.value.id`.
    // Nota: Dado que 'id' no es un control, form.value.id será undefined en el test estándar.
    // Verificamos que se llame update.
    
    component.form.setValue({
      orderId: '10',
      testTypeId: '20',
      laboratoryId: '30',
      priority: 'Alta',
      status: 'Pendiente',
      scheduledStart: '2023-01-01T10:00',
      scheduledEnd: '2023-01-01T11:00'
    });

    component.save();

    expect(orderTestService.update).toHaveBeenCalled();
  });

  it('save no debería proceder si el formulario es inválido', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.reset(); // Inválido
    component.save();

    expect(orderTestService.create).not.toHaveBeenCalled();
    expect(orderTestService.update).not.toHaveBeenCalled();
  });

  // --- 4. Manejo de Errores ---

  it('load debería manejar errores del servicio', () => {
    orderTestService.getAll.and.returnValue(throwError(() => 'Error'));
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.results()).toEqual([]);
  });

  it('save debería manejar errores del servicio y apagar loading', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.setValue({
      orderId: '1', testTypeId: '1', laboratoryId: '1', 
      priority: 'A', status: 'A', scheduledStart: 'A', scheduledEnd: 'A'
    });

    orderTestService.create.and.returnValue(throwError(() => 'Error'));

    component.save();

    expect(component.loading()).toBeFalse();
    // El formulario no se cierra en caso de error para permitir correcciones
    expect(component.showForm()).toBeTrue(); 
  });
});