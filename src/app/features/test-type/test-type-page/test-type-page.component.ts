import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'

import { TestTypeService } from '../service/test-type.service'
import { ParameterService } from '../../parameter/service/parameter.service'
import { AuthService } from '../../../features/auth/services/auth.service'

import {
  EntityTableComponent,
  TableColumn,
} from '../../../shared/component/entity-table.component'
import {
  FullScreenFormComponent,
  FullFormField,
} from '../../../shared/component/full-screen-form.component'

@Component({
  selector: 'app-test-type-page',
  standalone: true,
  template: `
<section class="container mt-4" aria-label="Gestión de tipos de examen">
  <div class="page-title">
    <h1>Tipos de Examen</h1>
  </div>

  @if (isAdmin()) {
  <button class="btn btn-primary mb-3" (click)="startCreate()">
    Crear tipo de examen
  </button>
  }

  @if (loading()) {
    <p class="text-muted">Cargando…</p>
  }

  <app-entity-table
    [data]="results()"
    [columns]="columns"
    [showActions]="isAdmin()"
    idKey="id"
    (edit)="onEdit($event)"
    (remove)="onDelete($event)"
  />

  @if (showForm()) {
    <app-fullscreen-form
      [title]="isEditing() ? 'Editar Tipo de Examen' : 'Crear Tipo de Examen'"
      [form]="form"
      [fields]="fields()"
      [disabled]="loading() || form.invalid"
      submitLabel="Guardar"
      (submitted)="save()"
      (closed)="closeForm()"
    />
  }
</section>
  `,
  imports: [ReactiveFormsModule, EntityTableComponent, FullScreenFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTypePageComponent implements OnInit {
  private readonly fb = new FormBuilder()
  private readonly service = inject(TestTypeService)
  private readonly paramService = inject(ParameterService)
  private readonly auth = inject(AuthService)

  loading = signal(false)
  isAdmin = signal(false)
  isEditing = signal(false)
  showForm = signal(false)
  editingId = signal<number | null>(null)

  results = signal<any[]>([])
  specializations = signal<{ value: number; description: string }[]>([])
  fields = signal<FullFormField[]>([])

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'code', label: 'Código' },
    { key: 'specialization', label: 'Especialización' },
    { key: 'sampleType', label: 'Tipo de muestra' },
  ]

  private buildFields(): FullFormField[] {
    return [
      { id: 'name', label: 'Nombre', controlName: 'name', type: 'text' },
      { id: 'code', label: 'Código', controlName: 'code', type: 'text' },
      {
        id: 'specialization',
        label: 'Especialización',
        controlName: 'specialization',
        type: 'select',
        options: this.specializations().map(s => ({
          label: s.description,
          value: s.description,     // IMPORTANTE: el backend usa String
        })),
      },
      {
        id: 'sampleType',
        label: 'Tipo de muestra',
        controlName: 'sampleType',
        type: 'text',
      },
    ]
  }

  form = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    specialization: ['', Validators.required],
    sampleType: ['', Validators.required],
  })

  startCreate() {
    if (!this.isAdmin()) return
    this.isEditing.set(false)
    this.editingId.set(null)
    this.form.reset()
    this.showForm.set(true)
  }

  onEdit(row: any) {
    if (!this.isAdmin()) return
    this.isEditing.set(true)
    this.editingId.set(row.id)
    this.form.patchValue(row)
    this.showForm.set(true)
  }

  onDelete(id: number) {
    if (!this.isAdmin()) return
    this.loading.set(true)

    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: () => this.loading.set(false),
    })
  }

  closeForm() {
    this.showForm.set(false)
  }

  loadSpecializations() {
    this.paramService.getSpecializations().subscribe({
      next: (r) => {
        this.specializations.set(r.data ?? [])
        this.fields.set(this.buildFields())
      },
    })
  }

  load() {
    this.loading.set(true)
    this.service.getAll().subscribe({
      next: (r) => {
        this.results.set(r.data ?? [])
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  save() {
    if (!this.isAdmin() || this.form.invalid || this.loading()) return

    this.loading.set(true)
    const raw = this.form.getRawValue()

    const dto = {
      name: raw.name!,
      code: raw.code!,
      specialization: raw.specialization!,   // sigue siendo String
      sampleType: raw.sampleType!,
    }

    const id = this.editingId()

    const req$ = id
      ? this.service.update(id, dto as any)
      : this.service.create(dto as any)

    req$.subscribe({
      next: () => {
        this.editingId.set(null)
        this.form.reset()
        this.showForm.set(false)
        this.load()
      },
      error: () => this.loading.set(false),
    })
  }

  ngOnInit() {
    this.auth.validateToken().subscribe({
      next: (u) => this.isAdmin.set(u.role === 'ADMIN'),
      error: () => this.isAdmin.set(false),
    })

    this.loadSpecializations()
    this.load()
  }
}
