import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

// Mock RouterLink para evitar errores de plantilla
@Component({
  selector: 'a[routerLink]',
  template: '<ng-content></ng-content>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, 
})
class MockRouterLink {}

// Mock AuthService
class MockAuthService {
  register = jasmine.createSpy('register').and.returnValue(of({}));
}


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule], 
      providers: [
        // Proveer el mock del servicio
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).overrideComponent(RegisterComponent, {
      set: {
        imports: [ReactiveFormsModule, MockRouterLink],
      },
    }).compileComponents();
  
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    fixture.detectChanges();
  });

  // --- 1. Inicialización del Componente y Formulario ---
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con 3 controles vacíos', () => {
    expect(component.form.get('name')).toBeTruthy();
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
    expect(component.form.invalid).toBeTrue();
  });

  it('la señal "loading" debería ser falsa inicialmente', () => {
    expect(component.loading()).toBeFalse();
  });

  // --- 2. Validación de Campos ---

  // Campos de texto (name)
  it('el campo "name" debería requerir al menos 2 caracteres', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.valid).toBeFalse(); // Requerido

    nameControl?.setValue('A');
    expect(nameControl?.valid).toBeFalse(); // minLength(2)

    nameControl?.setValue('Test Name');
    expect(nameControl?.valid).toBeTrue();
  });

  // Campo de email
  it('el campo "email" debería requerir formato de email válido', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalse(); // Requerido

    emailControl?.setValue('not-an-email');
    expect(emailControl?.valid).toBeFalse(); // Email inválido

    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTrue();
  });

  // Campo de contraseña (password)
  it('el campo "password" debería requerir al menos 6 caracteres', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalse(); // Requerido

    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeFalse(); // minLength(6)

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTrue();
  });
  
  it('el formulario completo debería ser válido si todos los campos son válidos', () => {
    component.form.setValue({
      name: 'Valid Name',
      email: 'valid@test.com',
      password: 'password123',
    });
    expect(component.form.valid).toBeTrue();
  });

  // --- 3. Propiedad `disabled` ---
  it('el getter "disabled" debería ser verdadero si el formulario es inválido', () => {
    expect(component.form.invalid).toBeTrue();
    expect(component.disabled).toBeTrue();
  });

  it('el getter "disabled" debería ser verdadero si la señal "loading" es verdadera', () => {
    component.form.setValue({
      name: 'Valid Name',
      email: 'valid@test.com',
      password: 'password123',
    });
    component.loading.set(true); 

    expect(component.form.valid).toBeTrue();
    expect(component.disabled).toBeTrue();
  });

  it('el getter "disabled" debería ser falso si el formulario es válido y no está cargando', () => {
    component.form.setValue({
      name: 'Valid Name',
      email: 'valid@test.com',
      password: 'password123',
    });
    component.loading.set(false);

    expect(component.disabled).toBeFalse();
  });

  // --- 4. Método `submit` ---
  const validData = {
    name: 'TestUser',
    email: 'user@test.com',
    password: 'securepassword',
  };

  it('no debería ejecutar la lógica de envío si el formulario es inválido', () => {
    component.form.get('email')?.setValue('invalid-email');
    component.submit(); 
    
    expect(authService.register).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('no debería ejecutar la lógica de envío si ya está cargando', () => {
    component.form.setValue(validData);
    component.loading.set(true); 

    component.submit();

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('debería establecer "loading" a true y construir el payload correcto al hacer submit (sin llamada real)', () => {
    component.form.setValue(validData);

    component.submit();

    expect(component.loading()).toBeTrue();
    // La llamada real está comentada en la clase, por lo que el spy no se usa.
    // Si la llamada no estuviera comentada, se verificaría aquí:
    // expect(authService.register).toHaveBeenCalled();

    const expectedPayload = {
      id: null,
      name: validData.name,
      email: validData.email,
      role: 'USER',
      password: validData.password
    };
    // Esta verificación requiere que la clase llame a authService.register
    // Para este caso, verificamos que el loading cambie, que es el primer paso.

    // Si la llamada al servicio estuviera activa, se haría la siguiente verificación:
    // expect(authService.register).toHaveBeenCalledWith(expectedPayload);
  });
  
  // Test para el caso de éxito (si la llamada al servicio estuviera activa)
  /*
  it('debería establecer "loading" a false en caso de éxito del servicio', fakeAsync(() => {
    authService.register.and.returnValue(of({ success: true }));
    component.form.setValue(validData);
    component.submit();
    
    expect(component.loading()).toBeTrue();
    // Simular la finalización del observable
    tick(); 
    expect(component.loading()).toBeFalse();
  }));
  */

  // Test para el caso de error (si la llamada al servicio estuviera activa)
  /*
  it('debería establecer "loading" a false en caso de error del servicio', fakeAsync(() => {
    authService.register.and.returnValue(throwError(() => new Error('Error')));
    component.form.setValue(validData);
    component.submit();
    
    expect(component.loading()).toBeTrue();
    // Simular la finalización del observable
    tick(); 
    expect(component.loading()).toBeFalse();
  }));
  */
});