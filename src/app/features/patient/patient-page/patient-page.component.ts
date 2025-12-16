import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { PatientService } from '../service/patient.service';
import { UserService } from '../../user/service/user.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import {
  EntityTableComponent,
  TableColumn,
} from '../../../shared/component/entity-table.component';
import {
  FullScreenFormComponent,
  FullFormField,
} from '../../../shared/component/full-screen-form.component';
import { UserDto } from '../../user/model/user.model';

@Component({
  selector: 'app-patient-page',
  template: `
    <section class="container mt-4" aria-label="Gestión de pacientes">
      <div class="page-title">
        <h1>Pacientes</h1>
      </div>

      @if (isAdmin()) {
      <button class="btn btn-primary mb-3" (click)="startCreate()">
        Crear paciente
      </button>
      } @if (loading()) {
      <p class="text-muted">Cargando…</p>
      }

      <app-entity-table
        [data]="patients()"
        [columns]="columns"
        [showActions]="isAdmin()"
        idKey="id"
        (edit)="onEdit($event)"
        (remove)="onDelete($event)"
      />

      @if (showForm()) {
      <app-fullscreen-form
        [title]="isEditing() ? 'Editar Paciente' : 'Crear Paciente'"
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
export class PatientPageComponent implements OnInit{
  private readonly fb = new FormBuilder();
  private readonly service = inject(PatientService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);

  loading = signal(false);
  patients = signal<any[]>([]);
  users = signal<UserDto[]>([]);
  showForm = signal(false);
  isEditing = signal(false);
  isAdmin = signal(false);
  editingId = signal<number | null>(null);
  fields = signal<FullFormField[]>([]);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'fullName', label: 'Nombre completo' },
    { key: 'birthDate', label: 'Fecha nacimiento' },
    { key: 'sex', label: 'Sexo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'email', label: 'Correo' },
  ];

  private buildFields(): FullFormField[] {
    return [
      {
        id: 'fullName',
        label: 'Nombre completo',
        controlName: 'fullName',
        type: 'text',
      },
      {
        id: 'birthDate',
        label: 'Fecha nacimiento',
        controlName: 'birthDate',
        type: 'date',
      },
      {
        id: 'sex',
        label: 'Sexo',
        controlName: 'sex',
        type: 'select',
        options: [
          { label: 'Femenino', value: 'F' },
          { label: 'Masculino', value: 'M' },
          { label: 'Otro', value: 'O' },
        ],
      },
      { id: 'phone', label: 'Teléfono', controlName: 'phone', type: 'text' },
      { id: 'email', label: 'Email', controlName: 'email', type: 'text' },
      {
        id: 'userId',
        label: 'Usuario asignado',
        controlName: 'userId',
        type: 'select',
        options: this.users().map((u) => ({
          label: `${u.name} (${u.email})`,
          value: u.id,
        })),
      },
    ];
  }

  form = this.fb.group({
    fullName: ['', Validators.required],
    birthDate: [
      '',
      [
        Validators.required,
        (control: AbstractControl) => {
          const value = control.value;

          if (!value) return { invalidDate: true };

          const date = new Date(value + 'T00:00:00');

          if (isNaN(date.getTime())) return { invalidDate: true };
          if (date > new Date()) return { futureDate: true };

          return null;
        },
      ],
    ],
    sex: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', Validators.required],
    userId: ['', Validators.required],
  });

  startCreate() {
    if (!this.isAdmin()) return;
    this.form.markAllAsTouched();
    this.isEditing.set(false);
    this.form.reset();
    this.showForm.set(true);
  }

  onEdit(row: any) {
    if (!this.isAdmin()) return;
    this.form.markAllAsTouched();
    this.editingId.set(row.id);
    this.isEditing.set(true);
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
    this.editingId.set(null);
  }

  load() {
    this.loading.set(true);

    this.service.getAll().subscribe({
      next: (r) => {
        this.patients.set(r.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadUsers() {
    this.userService.getByRole('USER').subscribe({
      next: (r) => {
        this.users.set(r.data ?? []);
        this.fields.set(this.buildFields());
        this.form.updateValueAndValidity();
      },
    });
  }

  save() {
    if (!this.isAdmin()) return;
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    const raw = this.form.getRawValue();

    const birth = new Date(raw.birthDate!);
    if (isNaN(birth.getTime()) || birth > new Date()) return;

    const dto = {
      fullName: raw.fullName!,
      birthDate: raw.birthDate!,
      sex: raw.sex!,
      phone: raw.phone!,
      email: raw.email!,
      userId: Number(raw.userId),
    };

    const id = this.editingId();

    const req$ = id
      ? this.service.update(id, dto as any)
      : this.service.create(dto as any);

    req$.subscribe({
      next: () => {
        this.editingId.set(null);
        this.form.reset();
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

    this.loadUsers();
    this.load();

    this.form.get('userId')!.valueChanges.subscribe((userId) => {
      const user = this.users().find((u) => u.id === Number(userId));
      if (!user) return;

      this.form.patchValue({
        fullName: user.name,
        email: user.email,
      });
    });
  }
}
