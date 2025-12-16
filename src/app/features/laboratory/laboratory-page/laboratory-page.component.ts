import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LaboratoryService } from '../service/laboratory.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import {
  EntityTableComponent,
  TableColumn,
} from '../../../shared/component/entity-table.component';
import {
  FullScreenFormComponent,
  FullFormField,
} from '../../../shared/component/full-screen-form.component';
import { ParameterService } from '../../parameter/service/parameter.service';

@Component({
  selector: 'app-laboratory-page',
  standalone: true,
  template: `
    <section class="container mt-4" aria-label="Gestión de laboratorios">
      <div class="page-title">
        <h1>Laboratorios</h1>
      </div>

      @if (isAdmin()) {
      <button class="btn btn-primary mb-3" (click)="startCreate()">
        Crear laboratorio
      </button>
      } @if (loading()) {
      <p class="text-muted">Cargando…</p>
      }

      <app-entity-table
        [data]="labs()"
        [columns]="columns"
        [showActions]="isAdmin()"
        idKey="id"
        (edit)="onEdit($event)"
        (remove)="onDelete($event)"
      />

      @if (showForm()) {
      <app-fullscreen-form
        [title]="isEditing() ? 'Editar Laboratorio' : 'Crear Laboratorio'"
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
export class LaboratoryPageComponent implements OnInit{
  private readonly fb = new FormBuilder();
  private readonly service = inject(LaboratoryService);
  private readonly auth = inject(AuthService);
  private readonly params = inject(ParameterService);
  loading = signal(false);
  isEditing = signal(false);
  showForm = signal(false);
  isAdmin = signal(false);
  specializations = signal<{ value: number; description: string }[]>([]);
  labs = signal<any[]>([]);
  fields = signal<FullFormField[]>([]);
  editingId = signal<number | null>(null);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'location', label: 'Ubicación' },
    { key: 'capacity', label: 'Capacidad' },
    { key: 'specialization', label: 'Especialización' },
  ];

  private buildFields(): FullFormField[] {
    return [
      { id: 'name', label: 'Nombre', controlName: 'name', type: 'text' },
      {
        id: 'location',
        label: 'Ubicación',
        controlName: 'location',
        type: 'text',
      },
      {
        id: 'capacity',
        label: 'Capacidad',
        controlName: 'capacity',
        type: 'text',
      },
      {
        id: 'specialization',
        label: 'Especialización',
        controlName: 'specialization',
        type: 'select',
        options: this.specializations().map((s) => ({
          label: s.description,
          value: s.description,
        })),
      },
    ];
  }

  form = this.fb.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
    capacity: ['', Validators.required],
    specialization: ['', Validators.required],
  });

  startCreate() {
    if (!this.isAdmin()) return;
    this.isEditing.set(false);
    this.form.reset();
    this.showForm.set(true);
  }

  onEdit(row: any) {
    if (!this.isAdmin()) return;
    this.isEditing.set(true);
    this.editingId.set(row.id);
    this.form.patchValue(row);
    this.showForm.set(true);
  }

  onDelete(id: number) {
    if (!this.isAdmin()) return;
    this.loading.set(true);
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: () => this.loading.set(false),
    });
  }

  closeForm() {
    this.showForm.set(false);
  }

  load() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (r) => {
        this.labs.set(r.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save() {
    if (!this.isAdmin() || this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const raw = this.form.getRawValue();

    const dto = {
      id: this.isEditing() ? (this.form.value as any).id : undefined,
      name: raw.name!,
      location: raw.location!,
      capacity: Number(raw.capacity),
      specialization: raw.specialization!,
    };

    const current = this.isEditing() ? this.form.value : null;
    const id = this.editingId();

    const req$ = current
      ? this.service.update({ ...(dto as any), id: id })
      : this.service.create(dto as any);

    req$.subscribe({
      next: () => {
        this.form.reset();
        this.showForm.set(false);
        this.editingId.set(null);
        this.load();
      },
      error: () => this.loading.set(false),
    });
  }
  loadSpecializations() {
    this.params.getSpecializations().subscribe({
      next: (r) => {
        this.specializations.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });
  }
  ngOnInit() {
    this.auth.validateToken().subscribe({
      next: (u) => this.isAdmin.set(u.role === 'ADMIN'),
      error: () => this.isAdmin.set(false),
    });
    this.loadSpecializations();
    this.fields.set(this.buildFields());
    this.load();
  }
}
