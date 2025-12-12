import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserPageComponent } from './user-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UserService } from '../service/user.service';
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
class MockUserService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of({ data: [], success: true }));
  update = jasmine.createSpy('update').and.returnValue(of({ success: true }));
  delete = jasmine.createSpy('delete').and.returnValue(of({ success: true }));
}

class MockAuthService {
  validateToken = jasmine.createSpy('validateToken').and.returnValue(of({ role: 'ADMIN' }));
}

describe('UserPageComponent', () => {
  let component: UserPageComponent;
  let fixture: ComponentFixture<UserPageComponent>;
  
  let userService: MockUserService;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPageComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: AuthService, useClass: MockAuthService },
      ]
    })
    .overrideComponent(UserPageComponent, {
      remove: { imports: [EntityTableComponent, FullScreenFormComponent] },
      add: { imports: [MockEntityTableComponent, MockFullScreenFormComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPageComponent);
    component = fixture.componentInstance;
    
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  // --- 1. Inicialización ---

  it('debería crear el componente e inicializar datos', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(authService.validateToken).toHaveBeenCalled();
    expect(userService.getAll).toHaveBeenCalled();
    expect(component.fields().length).toBeGreaterThan(0);
  });

  it('debería ser admin si el rol es ADMIN', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();
    expect(component.isAdmin()).toBeTrue();
  });

  it('no debería ser admin si el rol es USER', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();
    expect(component.isAdmin()).toBeFalse();
  });

  // --- 2. Acciones UI (Admin) ---

  it('startEditEmpty debería reiniciar formulario y mostrarlo', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.patchValue({ name: 'Old' });
    
    component.startEditEmpty();

    expect(component.isEditing()).toBeFalse();
    expect(component.showForm()).toBeTrue();
    expect(component.form.value.name).toBeFalsy();
  });

  it('startEditEmpty no debería hacer nada si no es admin', () => {
    authService.validateToken.and.returnValue(of({ role: 'USER' }));
    fixture.detectChanges();

    component.startEditEmpty();
    expect(component.showForm()).toBeFalse();
  });

  it('onEdit debería cargar datos en el formulario', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    const mockRow = {
      id: 1,
      name: 'Test User',
      email: 'test@mail.com',
      role: 'USER',
      password: '123'
    };

    component.onEdit(mockRow);

    expect(component.isEditing()).toBeTrue();
    expect(component.showForm()).toBeTrue();
    expect(component.form.get('name')?.value).toBe('Test User');
  });

  it('onDelete debería llamar a delete y recargar', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.onDelete(10);

    expect(userService.delete).toHaveBeenCalledWith(10);
    expect(userService.getAll).toHaveBeenCalledTimes(2); // Init + reload
  });

  // --- 3. Guardado (Save) ---

  it('save (Create) debería llamar a update con el DTO (según lógica del componente)', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(false);
    
    component.form.setValue({
      name: 'New User',
      email: 'new@mail.com',
      role: 'USER',
      password: '123'
    });

    component.save();

    expect(component.loading()).toBeTrue();
    expect(userService.update).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New User',
      email: 'new@mail.com'
    }));
    expect(component.showForm()).toBeFalse();
  });

  it('save (Edit) debería llamar a update', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.isEditing.set(true);
    
    // Configurar formulario válido
    component.form.setValue({
      name: 'Edit User',
      email: 'edit@mail.com',
      role: 'ADMIN',
      password: '123'
    });

    component.save();

    expect(userService.update).toHaveBeenCalled();
    expect(component.showForm()).toBeFalse();
  });

  it('save no debería ejecutarse si el formulario es inválido', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.reset(); // Inválido
    component.save();

    expect(userService.update).not.toHaveBeenCalled();
  });

  it('save debería manejar errores del servicio', () => {
    authService.validateToken.and.returnValue(of({ role: 'ADMIN' }));
    fixture.detectChanges();

    component.form.setValue({
      name: 'User',
      email: 'u@u.com',
      role: 'U',
      password: '123'
    });

    userService.update.and.returnValue(throwError(() => 'Error'));

    component.save();

    expect(component.loading()).toBeFalse();
    // El formulario no se cierra en error
    expect(component.showForm()).toBeTrue(); 
  });

  it('closeForm debería ocultar el formulario', () => {
    component.showForm.set(true);
    component.closeForm();
    expect(component.showForm()).toBeFalse();
  });

  it('load debería manejar errores', () => {
    userService.getAll.and.returnValue(throwError(() => 'Error'));
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.users()).toEqual([]);
  });
});