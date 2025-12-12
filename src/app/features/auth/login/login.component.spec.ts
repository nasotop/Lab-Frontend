import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'a[routerLink]',
  template: '<ng-content></ng-content>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, 
})
class MockRouterLink {}

class MockAuthService {
  login = jasmine.createSpy('login').and.returnValue(of({}));
  saveToken = jasmine.createSpy('saveToken');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ]
    }).overrideComponent(LoginComponent, {
      set: {
        imports: [ReactiveFormsModule, MockRouterLink],
      },
    }).compileComponents();
  
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario inválido', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.formValid()).toBeFalse();
    expect(component.disabled()).toBeTrue();
  });

  it('debería validar email requerido y formato', () => {
    const emailControl = component.form.get('email');
    
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTrue();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTrue();

    emailControl?.setValue('valid@test.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('debería validar password requerido y longitud mínima', () => {
    const passwordControl = component.form.get('password');
    
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBeTrue();

    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBeTrue();

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTrue();
  });

  it('debería actualizar la señal formValid y disabled cuando el formulario es válido', () => {
    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });

    expect(component.form.valid).toBeTrue();
    // statusChanges es asíncrono en la implementación interna de ReactiveForms a veces, 
    // pero setValue suele dispararlo. Verificamos el estado:
    expect(component.formValid()).toBeTrue();
    expect(component.disabled()).toBeFalse();
  });

  it('no debería enviar si el formulario es inválido', () => {
    component.submit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('no debería enviar si ya está cargando', () => {
    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });
    component.loading.set(true);
    
    component.submit();
    
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('debería realizar el flujo de login exitoso', () => {
    const mockToken = 'abc-123-token';
    const mockResponse = { 
      data: { token: mockToken }, 
      success: true, 
      message: null 
    };
    
    authService.login.and.returnValue(of(mockResponse));
    
    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });

    component.submit();

    expect(component.loading()).toBeTrue(); // Antes de finalizar el observable
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });
    
    // Al ser sincrono el of(), ya terminó
    expect(authService.saveToken).toHaveBeenCalledWith(mockToken);
    expect(component.loading()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/test-results']);
  });

  it('debería manejar el error en el login', () => {
    authService.login.and.returnValue(throwError(() => new Error('Error')));
    
    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });

    component.submit();

    expect(authService.login).toHaveBeenCalled();
    expect(authService.saveToken).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('debería no navegar si la respuesta no tiene token', () => {
    const mockResponse = { 
      data: { token: null }, // Sin token
      success: true, 
      message: null 
    };
    
    authService.login.and.returnValue(of(mockResponse));
    
    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });

    component.submit();

    expect(authService.login).toHaveBeenCalled();
    expect(authService.saveToken).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });
});