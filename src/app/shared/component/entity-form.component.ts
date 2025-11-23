import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

export interface FormField {
  id: string;
  label: string;
  controlName: string;
  type: string;
}

@Component({
  selector: 'app-entity-form',
  imports: [ReactiveFormsModule],
  template: `
    <form class="card p-3 mt-4" [formGroup]="form()" (ngSubmit)="submitted.emit()">
      <h2 class="h5 mb-3">{{ title() }}</h2>

      @for (field of fields(); track field.id) {
        <div class="mb-3">
          <label class="form-label" [for]="field.id">{{ field.label }}</label>

          <input
            class="form-control"
            [id]="field.id"
            [type]="field.type"
            [formControlName]="field.controlName"
            required
          />
        </div>
      }

      <button
        type="submit"
        class="btn btn-success"
        [disabled]="disabled()"
      >
        {{ submitLabel() }}
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityFormComponent {
  title = input.required<string>();
  form = input.required<FormGroup>();
  fields = input.required<FormField[]>();
  disabled = input.required<() => boolean>();
  submitLabel = input<string>('Guardar');

  submitted = output<void>();
}
