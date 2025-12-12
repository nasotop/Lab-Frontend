import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FullScreenFormComponent } from './full-screen-form.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormErrorsComponent } from './form-errors/form-errors.component';

@Component({
  selector: 'app-form-errors',
  standalone: true,
  template: ''
})
class MockFormErrorsComponent {
  @Input() control: any;
}

describe('FullScreenFormComponent', () => {
  let component: FullScreenFormComponent;
  let fixture: ComponentFixture<FullScreenFormComponent>;
  let formGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullScreenFormComponent, ReactiveFormsModule]
    })
    .overrideComponent(FullScreenFormComponent, {
      remove: { imports: [FormErrorsComponent] },
      add: { imports: [MockFormErrorsComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullScreenFormComponent);
    component = fixture.componentInstance;

    formGroup = new FormGroup({
      name: new FormControl(''),
      role: new FormControl(''),
      age: new FormControl('')
    });

    fixture.componentRef.setInput('title', 'Test Form');
    fixture.componentRef.setInput('form', formGroup);
    fixture.componentRef.setInput('fields', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    const titleEl = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleEl.textContent).toContain('Test Form');
  });

  it('should render input fields based on configuration', () => {
    const fields = [
      { id: 'name', label: 'Name', type: 'text', controlName: 'name' },
      { id: 'age', label: 'Age', type: 'number', controlName: 'age' }
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(2);
    expect(inputs[0].attributes['type']).toBe('text');
    expect(inputs[1].attributes['type']).toBe('number');
  });

  it('should render select fields with options', () => {
    const fields = [
      { 
        id: 'role', 
        label: 'Role', 
        type: 'select', 
        controlName: 'role',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' }
        ]
      }
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('select'));
    const options = fixture.debugElement.queryAll(By.css('option'));

    expect(select).toBeTruthy();
    expect(options.length).toBe(2);
    expect(options[0].nativeElement.textContent).toContain('Admin');
  });

  it('should emit submitted event when form is submitted', () => {
    let emitted = false;
    component.submitted.subscribe(() => emitted = true);

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);

    expect(emitted).toBeTrue();
  });

  it('should emit closed event when cancel button is clicked', () => {
    let emitted = false;
    component.closed.subscribe(() => emitted = true);

    const cancelBtn = fixture.debugElement.query(By.css('.btn-secondary'));
    cancelBtn.nativeElement.click();

    expect(emitted).toBeTrue();
  });

  it('should disable submit button when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('.btn-success'));
    expect(submitBtn.nativeElement.disabled).toBeTrue();
  });

  it('should display custom submit label', () => {
    fixture.componentRef.setInput('submitLabel', 'Update');
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('.btn-success'));
    expect(submitBtn.nativeElement.textContent).toContain('Update');
  });
});