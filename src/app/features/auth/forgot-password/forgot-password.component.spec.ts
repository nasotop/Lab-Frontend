import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'a[routerLink]',
  template: '<ng-content></ng-content>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, 
})
class MockRouterLink {}


describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule], 
    }).overrideComponent(ForgotPasswordComponent, {
      set: {
        imports: [ReactiveFormsModule, MockRouterLink],
      },
    }).compileComponents();
  
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con un campo de email vacío', () => {
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.invalid).toBeTrue();
  });

  it('la señal "loading" debería ser falsa inicialmente', () => {
    expect(component.loading()).toBeFalse();
  });

  it('el formulario debería ser inválido si el email está vacío', () => {
    component.form.get('email')?.setValue('');
    expect(component.form.get('email')?.valid).toBeFalse();
    expect(component.form.invalid).toBeTrue();
  });

  it('el formulario debería ser inválido si el email no tiene un formato válido', () => {
    component.form.get('email')?.setValue('noesunemail');
    expect(component.form.get('email')?.valid).toBeFalse();
    expect(component.form.invalid).toBeTrue();
  });

  it('el formulario debería ser válido si el email tiene un formato correcto', () => {
    component.form.get('email')?.setValue('test@example.com');
    expect(component.form.get('email')?.valid).toBeTrue();
    expect(component.form.valid).toBeTrue();
  });

  it('el getter "disabled" debería ser verdadero si el formulario es inválido', () => {
    expect(component.disabled).toBeTrue();
  });

  it('el getter "disabled" debería ser verdadero si la señal "loading" es verdadera', () => {
    component.form.get('email')?.setValue('test@example.com');
    component.loading.set(true); 

    expect(component.disabled).toBeTrue();
  });

  it('el getter "disabled" debería ser falso si el formulario es válido y no está cargando', () => {
    component.form.get('email')?.setValue('test@example.com');
    component.loading.set(false);

    expect(component.disabled).toBeFalse();
  });

  it('no debería llamar a la lógica de envío si el formulario es inválido', fakeAsync(() => {
    component.submit(); 
    tick(100);

    expect(component.loading()).toBeFalse();
  }));

  it('no debería llamar a la lógica de envío si ya está cargando', fakeAsync(() => {
    component.form.get('email')?.setValue('test@example.com');
    component.loading.set(true); 

    component.submit();
    tick(100);

    expect(component.loading()).toBeTrue();
  }));


  it('debería establecer "loading" a true al inicio de submit y a false después del timeout', fakeAsync(() => {
    const mockEmail = 'valid@example.com';
    component.form.get('email')?.setValue(mockEmail);

    expect(component.loading()).toBeFalse();

    component.submit();

    expect(component.loading()).toBeTrue();
    expect(component.form.getRawValue().email).toBe(mockEmail);

    tick(999);
    expect(component.loading()).toBeTrue();

    tick(1);
    
    expect(component.loading()).toBeFalse();
  }));
});