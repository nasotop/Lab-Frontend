import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormErrorsComponent } from './form-errors.component';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('FormErrorsComponent', () => {
  let component: FormErrorsComponent;
  let fixture: ComponentFixture<FormErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty error list if control is null', () => {
    component.control = null;
    expect(component.errorList()).toEqual([]);
  });

  it('should return empty error list if control has no errors', () => {
    component.control = new FormControl('valid');
    expect(component.errorList()).toEqual([]);
  });

  it('should return "required" message', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched(); 
    component.control = control;
    
    const errors = component.errorList();
    expect(errors).toContain('Este campo es obligatorio.');
  });

  it('should return "minlength" message with correct length', () => {
    const control = new FormControl('a', Validators.minLength(3));
    control.markAsTouched();
    component.control = control;

    const errors = component.errorList();
    expect(errors).toContain('Debe tener al menos 3 caracteres.');
  });

  it('should return "maxlength" message with correct length', () => {
    const control = new FormControl('abcd', Validators.maxLength(3));
    control.markAsTouched();
    component.control = control;

    const errors = component.errorList();
    expect(errors).toContain('Debe tener máximo 3 caracteres.');
  });

  it('should return "email" message', () => {
    const control = new FormControl('invalid-email', Validators.email);
    control.markAsTouched();
    component.control = control;

    const errors = component.errorList();
    expect(errors).toContain('Formato de correo inválido.');
  });

  it('should return custom messages for date errors', () => {
    const control = new FormControl('');
    component.control = control;

    control.setErrors({ invalidDate: true });
    expect(component.errorList()).toContain('Fecha inválida.');

    control.setErrors({ futureDate: true });
    expect(component.errorList()).toContain('La fecha no puede ser futura.');
  });

  it('should return default message for unknown errors', () => {
    const control = new FormControl('');
    component.control = control;

    control.setErrors({ unknownError: true });
    expect(component.errorList()).toContain('Campo inválido.');
  });

  it('should not render error container if control is invalid but untouched', () => {
    const control = new FormControl('', Validators.required);
    // Not touching the control
    component.control = control;
    fixture.detectChanges();

    const errorDiv = fixture.debugElement.query(By.css('.error'));
    expect(errorDiv).toBeNull();
  });

  it('should render error container and text when control is invalid and touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();

    const errorDiv = fixture.debugElement.query(By.css('.error'));
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.nativeElement.textContent).toContain('Este campo es obligatorio.');
  });
});