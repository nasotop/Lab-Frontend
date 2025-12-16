import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OrderService } from '../service/order.service';
import { PatientService } from '../../patient/service/patient.service';
import { ParameterService } from '../../parameter/service/parameter.service';
import { AuthService } from '../../../features/auth/services/auth.service';

import {
  EntityTableComponent,
  TableColumn,
} from '../../../shared/component/entity-table.component';

import {
  FullScreenFormComponent,
  FullFormField,
} from '../../../shared/component/full-screen-form.component';

import { PatientDto } from '../../patient/model/patient-dto.model';
import { ParameterDto } from '../../parameter/model/parameter.model';

@Component({
  selector: 'app-order-page',
  template: `
    <section class="container mt-4" aria-label="Gestión de órdenes">
      <div class="page-title">
        <h1>Órdenes</h1>
      </div>

      @if (isAdmin()) {
      <button class="btn btn-primary mb-3" (click)="startCreate()">
        Crear orden
      </button>
      } @if (loading()) {
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
        [title]="isEditing() ? 'Editar Orden' : 'Crear Orden'"
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
export class OrderPageComponent implements OnInit {
  private readonly fb = new FormBuilder();
  private readonly service = inject(OrderService);
  private readonly patientsService = inject(PatientService);
  private readonly parameterService = inject(ParameterService);
  private readonly auth = inject(AuthService);

  loading = signal(false);
  isEditing = signal(false);
  showForm = signal(false);
  isAdmin = signal(false);

  results = signal<any[]>([]);
  patients = signal<PatientDto[]>([]);
  statuses = signal<ParameterDto[]>([]);
  fields = signal<FullFormField[]>([]);
  editingId = signal<number | null>(null);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'patient.fullName', label: 'Paciente', formatter: (row: any) => row.patient?.fullName ?? '' },
    { key: 'orderedAt', label: 'Fecha orden' },
    { key: 'status', label: 'Estado' },
    { key: 'notes', label: 'Notas' },
  ];

  private buildFields(): FullFormField[] {
    return [
      {
        id: 'patientId',
        label: 'Paciente',
        controlName: 'patientId',
        type: 'select',
        options: this.patients().map((p) => ({
          label: p.fullName,
          value: p.id,
        })),
      },
      {
        id: 'status',
        label: 'Estado',
        controlName: 'status',
        type: 'select',
        options: this.statuses().map((s) => ({
          label: s.description,
          value: s.value,
        })),
      },
      { id: 'notes', label: 'Notas', controlName: 'notes', type: 'text' },
      {
        id: 'orderedAt',
        label: 'Fecha de Orden',
        controlName: 'orderedAt',
        type: 'date',
      },
    ];
  }

  form = this.fb.group({
    patientId: ['', Validators.required],
    status: ['', Validators.required],
    notes: [''],
    orderedAt: ['', Validators.required],
  });

  startCreate() {
    if (!this.isAdmin()) return;
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  onEdit(row: any) {
    if (!this.isAdmin()) return;

    this.isEditing.set(true);
    this.editingId.set(row.id);

    this.form.patchValue({
      patientId: row.patient?.id,
      status: row.status,
      notes: row.notes,
      orderedAt: row.orderedAt?.slice(0, 10),
    });

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
        this.results.set(r.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadPatients() {
    this.patientsService.getAll().subscribe({
      next: (r) => {
        this.patients.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });
  }

  loadOrderStatuses() {
    this.parameterService.getOrderStatus().subscribe({
      next: (r) => {
        this.statuses.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });
  }

  save() {
    if (!this.isAdmin() || this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const raw = this.form.getRawValue();

    const dto = {
      id: this.editingId(),
      patient: { id: Number(raw.patientId) },
      status:
        this.statuses().find((s) => s.value === Number(raw.status))
          ?.description ?? raw.status,
      notes: raw.notes!,
      orderedAt: raw.orderedAt + 'T00:00:00',
    };
    const req$ = this.editingId()
      ? this.service.update(dto as any)
      : this.service.create(dto as any);

    req$.subscribe({
      next: () => {
        this.form.reset();
        this.editingId.set(null);
        this.showForm.set(false);
        this.load();
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnInit() {
    this.auth.validateToken().subscribe({
      next: (u) => this.isAdmin.set(u.role === 'ADMIN'),
      error: () => this.isAdmin.set(false),
    });

    this.loadPatients();
    this.loadOrderStatuses();
    this.load();
  }
}
