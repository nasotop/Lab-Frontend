import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TestResultsService } from '../service/test-results.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import {
  EntityTableComponent,
  TableColumn,
} from '../../../shared/component/entity-table.component';
import {
  FullFormField,
  FullScreenFormComponent,
} from '../../../shared/component/full-screen-form.component';

import { OrderTestService } from '../../order-test/service/order-test.service';
import { TestResultDto } from '../model/test-result.dto';

@Component({
  selector: 'app-test-result-page',
  template: `
    <section class="container mt-4" aria-label="Gestión de resultados de test">
      <div class="page-title"><h1>Resultados de Exámenes</h1></div>
      @if (isAdmin()) {
      <button class="btn btn-primary mb-3" (click)="startCreate()">
        Crear nuevo
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
        [title]="isEditing() ? 'Editar Resultado' : 'Crear Resultado'"
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
export class TestResultPageComponent implements OnInit{
  private fb = new FormBuilder();
  private service = inject(TestResultsService);
  private orderTestService = inject(OrderTestService);
  private auth = inject(AuthService);

  loading = signal(false);
  isEditing = signal(false);
  showForm = signal(false);
  isAdmin = signal(false);
  editingId = signal<number | null>(null);

  results = signal<any[]>([]);
  statuses = signal<string[]>([]);
  orderTests = signal<any[]>([]);
  fields = signal<FullFormField[]>([]);

  columns: TableColumn[] = [
    { key: 'id', label: 'Número examen' },
    { key: 'orderTestId', label: 'Número orden' },
    { key: 'status', label: 'Estado' },
    { key: 'value', label: 'Valor' },
    { key: 'unit', label: 'Unidad' },
    { key: 'referenceRange', label: 'Rango referencia' },
    { key: 'interpretation', label: 'Interpretación' },
  ];

  private buildFields(): FullFormField[] {
    return [
      {
        id: 'orderTestId',
        label: 'Orden de Test',
        controlName: 'orderTestId',
        type: 'select',
        options: this.orderTests().map((o) => ({
          label: `OT-${o.id}`,
          value: o.id,
        })),
      },
      {
        id: 'value',
        label: 'Valor',
        controlName: 'value',
        type: 'text',
      },
      {
        id: 'unit',
        label: 'Unidad',
        controlName: 'unit',
        type: 'text',
      },
      {
        id: 'referenceRange',
        label: 'Rango de Referencia',
        controlName: 'referenceRange',
        type: 'text',
      },
      {
        id: 'interpretation',
        label: 'Interpretación',
        controlName: 'interpretation',
        type: 'text',
      },
      {
        id: 'status',
        label: 'Estado',
        controlName: 'status',
        type: 'select',
        options: this.statuses().map((x) => ({ label: x, value: x })),
      },
    ];
  }

  form = this.fb.group({
    orderTestId: ['', Validators.required],
    value: ['', Validators.required],
    unit: ['', Validators.required],
    referenceRange: ['', Validators.required],
    interpretation: ['', Validators.required],
    status: ['', Validators.required],
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
    this.form.patchValue({
      orderTestId: row.orderTestId,
      value: row.value,
      unit: row.unit,
      referenceRange: row.referenceRange,
      interpretation: row.interpretation,
      status: row.status,
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
    this.editingId.set(null);
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
    const v = this.form.getRawValue();

    const dto: TestResultDto = {
      id: this.isEditing() ? (this.form.value as any).id : 0,
      orderTestId: Number(v.orderTestId),
      collectedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      value: v.value!,
      unit: v.unit!,
      referenceRange: v.referenceRange!,
      interpretation: v.interpretation!,
      status: v.status!,
    };

    const id = this.editingId();

    const req$ = this.isEditing()
      ? this.service.update(id!, dto)
      : this.service.create(dto);

    req$.subscribe({
      next: () => {
        this.form.reset();
        this.editingId.set(null);
        this.showForm.set(false);
        this.load();
      },
      error: () => {
        this.editingId.set(null);
        this.loading.set(false);
      },
    });
  }

  ngOnInit() {
    this.auth.validateToken().subscribe({
      next: (u) => this.isAdmin.set(u.role === 'ADMIN'),
      error: () => this.isAdmin.set(false),
    });

    this.load();

    this.orderTestService.getAll().subscribe({
      next: (r) => {
        this.orderTests.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });

    this.service.getTestStatuses().subscribe({
      next: (r) => {
        this.statuses.set(r.data ?? []);
        this.fields.set(this.buildFields());
      },
    });
  }
}
