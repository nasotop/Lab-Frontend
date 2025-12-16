import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-errors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error" *ngIf="control && control.invalid && control.touched">
      @for (err of errorList(); track err) {
        <div>{{ err }}</div>
      }
    </div>
  `,
  styles: [`
    .error {
      color: #d32f2f;
      font-size: 0.85rem;
      margin-top: 4px;
    }
  `]
})
export class FormErrorsComponent {
  @Input() control!: AbstractControl | null;

  private readonly messages: Record<string,(err:any)=>string> = {
    required: () => 'Este campo es obligatorio.',
    minlength: (e) => `Debe tener al menos ${e.requiredLength} caracteres.`,
    maxlength: (e) => `Debe tener máximo ${e.requiredLength} caracteres.`,
    email: () => 'Formato de correo inválido.',
    invalidDate: () => 'Fecha inválida.',
    futureDate: () => 'La fecha no puede ser futura.',
    pattern: () => 'Formato inválido.',
  };

  errorList(): string[] {
    if (!this.control?.errors) return [];
    return Object.entries(this.control.errors).map(([key, value]) => {
      const handler = this.messages[key];
      return handler ? handler(value) : 'Campo inválido.';
    });
  }
}
