import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { OrderTestService } from '../service/order-test.service';
import { OrderService } from '../../order/service/order.service';
import { LaboratoryService } from '../../laboratory/service/laboratory.service';
import { TestTypeService } from '../../test-type/service/test-type.service';

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
  selector: 'app-order-test-page',
  template: `
    <section class="container mt-4" aria-label="Gestión de órdenes de examen">
      <div class="page-title">
        <h1>Órdenes de Examen</h1>
      </div>

      @if (isAdmin()) {
      <button class="btn btn-primary mb-3" (click)="startCreate()">
        Crear nueva orden
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
export class OrderTestPageComponent implements OnInit{
  private fb = new FormBuilder();
  private service = inject(OrderTestService);
  private orderService = inject(OrderService);
  private labService = inject(LaboratoryService);
  private testTypeService = inject(TestTypeService);
  private parameterService = inject(ParameterService);
  private auth = inject(AuthService);

  loading = signal(false);
  isAdmin = signal(false);
  isEditing = signal(false);
  showForm = signal(false);
  priorities = signal<any[]>([]);
  statuses = signal<any[]>([]);
  results = signal<any[]>([]);
  orders = signal<any[]>([]);
  labs = signal<any[]>([]);
  testTypes = signal<any[]>([]);

  fields = signal<FullFormField[]>([]);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'priority', label: 'Prioridad' },
    { key: 'status', label: 'Estado' },
    { key: 'scheduledStart', label: 'Inicio Programado' },
    { key: 'scheduledEnd', label: 'Fin Programado' },
  ];

  private buildFields(): FullFormField[] {
    return [
      {
        id: 'orderId',
        label: 'Orden',
        controlName: 'orderId',
        type: 'select',
        options: this.orders().map((o) => ({
          label: `Orden ${o.id} - ${o.patient.fullName}`,
          value: o.id,
        })),
      },
      {
        id: 'testTypeId',
        label: 'Tipo de Examen',
        controlName: 'testTypeId',
        type: 'select',
        options: this.testTypes().map((t) => ({
          label: `${t.name} (${t.code})`,
          value: t.id,
        })),
      },
      {
        id: 'laboratoryId',
        label: 'Laboratorio',
        controlName: 'laboratoryId',
        type: 'select',
        options: this.labs().map((l) => ({
          label: `${l.name} (${l.specialization})`,
          value: l.id,
        })),
      },

      {
        id: 'priority',
        label: 'Prioridad',
        controlName: 'priority',
        type: 'select',
        options: this.priorities().map((p) => ({
          label: p.description,
          value: p.description,
        })),
      },

      {
        id: 'status',
        label: 'Estado',
        controlName: 'status',
        type: 'select',
        options: this.statuses().map((s) => ({
          label: s.description,
          value: s.description,
        })),
      },

      {
        id: 'scheduledStart',
        label: 'Inicio Programado',
        controlName: 'scheduledStart',
        type: 'datetime-local',
      },
      {
        id: 'scheduledEnd',
        label: 'Fin Programado',
        controlName: 'scheduledEnd',
        type: 'datetime-local',
      },
    ];
  }

  form = this.fb.group({
    orderId: ['', Validators.required],
    testTypeId: ['', Validators.required],
    laboratoryId: ['', Validators.required],
    priority: ['', Validators.required],
    status: ['', Validators.required],
    scheduledStart: ['', Validators.required],
    scheduledEnd: ['', Validators.required],
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

    this.form.patchValue({
      orderId: row.order?.id ?? '',
      testTypeId: row.testType?.id ?? '',
      laboratoryId: row.laboratory?.id ?? '',
      priority: row.priority,
      status: row.status,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd,
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

  save() {
    if (!this.isAdmin() || this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const raw = this.form.getRawValue();
    const selectedPriority = this.priorities().find(
      (p) => p.value === Number(raw.priority)
    );
    const selectedStatus = this.statuses().find(
      (s) => s.value === Number(raw.status)
    );

    const dto = {
      id: this.isEditing() ? (this.form.value as any).id : null,
      orderId: Number(raw.orderId),
      testTypeId: Number(raw.testTypeId),
      laboratoryId: Number(raw.laboratoryId),
      priority: raw.priority!,
      status: raw.status!,
      scheduledStart: raw.scheduledStart!,
      scheduledEnd: raw.scheduledEnd!,
    };

    const req$ = this.isEditing()
      ? this.service.update((this.form.value as any).id, dto)
      : this.service.create(dto);

    req$.subscribe({
      next: () => {
        this.form.reset();
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

    this.orderService.getAll().subscribe({
      next: (r) => {
        this.orders.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });

    this.labService.getAll().subscribe({
      next: (r) => {
        this.labs.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });

    this.testTypeService.getAll().subscribe({
      next: (r) => {
        this.testTypes.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });
    this.parameterService.getPriorities().subscribe({
      next: (r) => {
        this.priorities.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });

    this.parameterService.getTestStatus().subscribe({
      next: (r) => {
        this.statuses.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });
    this.load();
  }
}
