import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientPageComponent } from './patient-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Servicios
import { PatientService } from '../service/patient.service';
import { UserService } from '../../user/service/user.service';
import { AuthService } from '../../../features/auth/services/auth.service';

// 1. IMPORTAR COMPONENTES REALES (Para poder eliminarlos en el override)
import { EntityTableComponent } from '../../../shared/component/entity-table.component';
import { FullScreenFormComponent } from '../../../shared/component/full-screen-form.component';

// 2. MOCKS DE COMPONENTES HIJOS
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

// 3. MOCKS DE SERVICIOS
class MockPatientService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ data: [], success: true }));
  create = jasmine.createSpy('create').and.returnValue(of({ success: true }));
  update = jasmine.createSpy('update').and.returnValue(of({ success: true }));
  delete = jasmine.createSpy('delete').and.returnValue(of({ success: true }));
}

class MockUserService {
  getByRole = jasmine.createSpy('getByRole').and.returnValue(of({ 
    data: [
      { id: 10, name: 'Juan Perez', email: 'juan@test.com' },
      { id: 20, name: 'Maria Gomez', email: 'maria@test.com' }
    ], 
    success: true 
  }));
}

class MockAuthService {
  validateToken = jasmine.createSpy('validateToken').and.returnValue(of({ role: 'ADMIN' }));
}

describe('PatientPageComponent', () => {
  let component: PatientPageComponent;
  let fixture: ComponentFixture<PatientPageComponent>;
  
  let patientService: MockPatientService;
  let userService: MockUserService;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPageComponent, ReactiveFormsModule],
      providers: [
        { provide: PatientService, useClass: MockPatientService },
        { provide: UserService, useClass: MockUserService },
        { provide: AuthService, useClass: MockAuthService },
      ]
    })
    .overrideComponent(PatientPageComponent, {
      // Eliminamos los componentes reales y agregamos los mocks
      remove: { imports: [EntityTableComponent, FullScreenFormComponent] },
      add: { imports: [MockEntityTableComponent, MockFullScreenFormComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientPageComponent);
    component = fixture.componentInstance;

    patientService = TestBed.inject(PatientService) as unknown as MockPatientService;
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  // --- 1. Inicialización ---

  it('debería crear el componente e inicializar datos correctamente', () => {
    fixture.detectChanges(); // Ejecuta ngOnInit

    expect(component).toBeTruthy();
    expect(authService.validateToken).toHaveBeenCalled();
    expect(userService.getByRole).toHaveBeenCalledWith('USER');
    expect(patientService.getAll).toHaveBeenCalled();
    
    // Verificar que los usuarios se cargaron
    expect(component.users().length).toBe(2);
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

  // --- 2. Validaciones de Formulario (Específicas de Fechas) ---

  it('debería validar que birthDate no sea una fecha futura', () => {
    fixture.detectChanges();
    const control = component.form.get('birthDate');

    // Fecha futura (Año 3000)
    control?.setValue('3000-01-01');
    expect(control?.hasError('futureDate')).toBeTrue();
    expect(control?.valid).toBeFalse();

    // Fecha pasada válida (Año 2000)
    control?.setValue('2000-01-01');
    expect(control?.hasError('futureDate')).toBeFalse();
    // Nota: El control podría ser inválido por otros campos requeridos, 
    // pero verificamos específicamente el error de fecha.
    expect(control?.errors).toBeNull(); 
  });

  it('debería marcar error si birthDate es inválido', () => {
    fixture.detectChanges();
    const control = component.form.get('birthDate');
    
    // Cadena vacía
    control?.setValue('');
    expect(control?.hasError('required')).toBeTrue();
  });

  // --- 3. Lógica Reactiva (Auto-fill) ---

  it('debería autocompletar nombre y email al seleccionar un usuario', fakeAsync(() => {
    fixture.detectChanges(); // Carga usuarios (MockUserService devuelve id: 10 y id: 20)

    // Seleccionar usuario con ID 10
    component.form.get('userId')?.setValue('10');
    tick(); // Procesar valueChanges

    expect(component.form.get('fullName')?.value).toBe('Juan Perez');
    expect(component.form.get('email')?.value).toBe('juan@test.com');

    // Cambiar a usuario con ID 20
    component.form.get('userId')?.setValue('20');
    tick();

    expect(component.form.get('fullName')?.value).toBe('Maria Gomez');
    expect(component.form.get('email')?.value).toBe('maria@test.com');
  }));

  // --- 4. Acciones CRUD ---

  it('startCreate debería reiniciar el formulario', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.patchValue({ fullName: 'Sucio' });
    component.startCreate();

    expect(component.isEditing()).toBeFalse();
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.fullName).toBeFalsy(); // null o ''
  });

  it('onEdit debería cargar datos en el formulario', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    const mockRow = { id: 5, fullName: 'Test', birthDate: '1990-01-01', sex: 'M', phone: '123', email: 't@t.com', userId: 10 };
    component.onEdit(mockRow);

    expect(component.isEditing()).toBeTrue();
    expect(component.editingId()).toBe(5);
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.fullName).toBe('Test');
  });

  it('onDelete debería llamar al servicio delete', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.onDelete(123);

    expect(patientService.delete).toHaveBeenCalledWith(123);
    expect(patientService.getAll).toHaveBeenCalledTimes(2); // Init + Delete reload
  });

  // --- 5. Guardado (Save) ---

  it('save debería crear un paciente si no está editando', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    
    component.isEditing.set(false);
    component.editingId.set(null);

    component.form.setValue({
      fullName: 'New Patient',
      birthDate: '2000-01-01',
      sex: 'M',
      phone: '555-5555',
      email: 'new@patient.com',
      userId: '10'
    });

    component.save();

    expect(patientService.create).toHaveBeenCalled();
    const args = patientService.create.calls.mostRecent().args[0];
    // Verificar que userId se convirtió a número
    expect(args.userId).toBe(10); 
    expect(component.showForm()).toBeFalse();
  });

  it('save debería actualizar un paciente si está editando', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(true);
    component.editingId.set(99);

    component.form.setValue({
      fullName: 'Update Patient',
      birthDate: '1999-12-31',
      sex: 'F',
      phone: '111-1111',
      email: 'update@patient.com',
      userId: '20'
    });

    component.save();

    expect(patientService.update).toHaveBeenCalledWith(99, jasmine.any(Object));
    expect(component.showForm()).toBeFalse();
  });

  it('save no debería ejecutarse si el formulario es inválido', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.reset(); // Formulario vacío/inválido
    component.save();

    expect(patientService.create).not.toHaveBeenCalled();
    expect(patientService.update).not.toHaveBeenCalled();
  });

  it('save no debería ejecutarse si la fecha de nacimiento es futura (doble verificación)', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.patchValue({
      fullName: 'Futurist',
      birthDate: '3000-01-01', // Futuro
      sex: 'M',
      phone: '123',
      email: 'a@a.com',
      userId: '10'
    });

    component.save();

    expect(patientService.create).not.toHaveBeenCalled();
  });
});