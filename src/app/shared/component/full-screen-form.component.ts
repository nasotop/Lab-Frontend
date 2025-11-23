import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormErrorsComponent } from './form-errors/form-errors.component';

export interface FullFormSelectOption {
  value: string | number;
  label: string;
}

export interface FullFormField {
  id: string;
  label: string;
  type: string;
  controlName: string;
  options?: FullFormSelectOption[];
}

@Component({
  selector: 'app-fullscreen-form',
  imports: [ReactiveFormsModule, FormErrorsComponent],
  template: `
    <div class="fullscreen-container">
      <div class="container py-4">
        <div class="row justify-content-center">
          <div
            class="col-12 col-sm-10 col-md-8 col-lg-6 bg-white bg-opacity-75 p-4 rounded shadow"
          >
            <h1 class="mb-4">{{ title() }}</h1>

            <form [formGroup]="form()" (ngSubmit)="submitted.emit()">
              @for (field of fields(); track field.id) {
              <div class="mb-3">
                <label class="form-label">{{ field.label }}</label>

                @if (field.type === 'select') {
                <select
                  class="form-select"
                  [formControlName]="field.controlName"
                  required
                >
                  @for (opt of field.options ?? []; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                } @else {
                <input
                  class="form-control"
                  [type]="field.type"
                  [formControlName]="field.controlName"
                  required
                />
                }

                <app-form-errors
                  [control]="form().controls[field.controlName]"
                ></app-form-errors>
              </div>
              }

              <div class="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  class="btn btn-success"
                  [disabled]="disabled()"
                >
                  {{ submitLabel() }}
                </button>

                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="closed.emit()"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .fullscreen-container {
        position: fixed;
        inset: 0;
        min-height: 100vh;
        height: auto;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullScreenFormComponent {
  title = input.required<string>();
  form = input.required<FormGroup>();
  fields = input.required<FullFormField[]>();
  disabled = input<boolean>(false);

  submitLabel = input<string>('Guardar');
  submitted = output<void>();
  closed = output<void>();
}
