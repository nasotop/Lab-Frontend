import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityFormComponent } from './entity-form.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('EntityFormComponent', () => {
  let component: EntityFormComponent;
  let fixture: ComponentFixture<EntityFormComponent>;
  let formGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityFormComponent);
    component = fixture.componentInstance;

    formGroup = new FormGroup({
      name: new FormControl(''),
      age: new FormControl(''),
    });

    fixture.componentRef.setInput('form', formGroup);
    fixture.componentRef.setInput('title', 'Test Form');
    fixture.componentRef.setInput('fields', []);
    fixture.componentRef.setInput('disabled', () => false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
    expect(titleElement.textContent).toBe('Test Form');
  });

  it('should render input fields based on input', () => {
    const fields = [
      { id: 'f1', label: 'Name', controlName: 'name', type: 'text' },
      { id: 'f2', label: 'Age', controlName: 'age', type: 'number' },
    ];

    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(2);
    expect(inputs[0].attributes['type']).toBe('text');
    expect(inputs[1].attributes['type']).toBe('number');
  });

  it('should emit submitted event on form submit', () => {
    let emitted = false;
    component.submitted.subscribe(() => (emitted = true));

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);

    expect(emitted).toBeTrue();
  });

  it('should disable the submit button when disabled function returns true', () => {
    fixture.componentRef.setInput('disabled', () => true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBeTrue();
  });

  it('should enable the submit button when disabled function returns false', () => {
    fixture.componentRef.setInput('disabled', () => false);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBeFalse();
  });

  it('should display default submit label', () => {
    const button = fixture.debugElement.query(
      By.css('button[type="submit"]')
    ).nativeElement;
    expect(button.textContent.trim()).toBe('Guardar');
  });

  it('should display custom submit label', () => {
    fixture.componentRef.setInput('submitLabel', 'Update');
    fixture.detectChanges();

    const button = fixture.debugElement.query(
      By.css('button[type="submit"]')
    ).nativeElement;
    expect(button.textContent.trim()).toBe('Update');
  });
});