import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { UserService } from '../service/user.service'
import { AuthService } from '../../../features/auth/services/auth.service'
import { EntityTableComponent, TableColumn } from '../../../shared/component/entity-table.component'
import { FullScreenFormComponent, FullFormField } from '../../../shared/component/full-screen-form.component'

@Component({
  selector: 'app-user-page',
  standalone: true,
  template: `
    <section class="container mt-4" aria-label="Gestión de usuarios">
      <div class="page-title">
        <h1>Usuarios</h1>
      </div>

      @if (isAdmin()) {
      <button class="btn btn-primary mb-3" (click)="startEditEmpty()">
        Crear usuario
      </button>
      }

      @if (loading()) {
        <p class="text-muted">Cargando…</p>
      }

      <app-entity-table
        [data]="users()"
        [columns]="columns"
        [showActions]="isAdmin()"
        idKey="id"
        (edit)="onEdit($event)"
        (remove)="onDelete($event)"
      />

      @if (showForm()) {
      <app-fullscreen-form
        [title]="isEditing() ? 'Editar Usuario' : 'Crear Usuario'"
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
export class UserPageComponent implements OnInit{
  private fb = new FormBuilder()
  private service = inject(UserService)
  private auth = inject(AuthService)

  loading = signal(false)
  showForm = signal(false)
  isEditing = signal(false)
  isAdmin = signal(false)

  users = signal<any[]>([])
  fields = signal<FullFormField[]>([])

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    { key: 'role', label: 'Rol' },
  ]

  private buildFields(): FullFormField[] {
    return [
      { id: 'name', label: 'Nombre', controlName: 'name', type: 'text' },
      { id: 'email', label: 'Correo', controlName: 'email', type: 'text' },
      { id: 'role', label: 'Rol', controlName: 'role', type: 'text' },
      { id: 'password', label: 'Contraseña', controlName: 'password', type: 'text' },
    ]
  }

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    role: ['', Validators.required],
    password: ['', Validators.required],
  })

  startEditEmpty() {
    if (!this.isAdmin()) return
    this.isEditing.set(false)
    this.form.reset()
    this.showForm.set(true)
  }

  onEdit(row: any) {
    if (!this.isAdmin()) return
    this.isEditing.set(true)
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

  load() {
    this.loading.set(true)
    this.service.getAll().subscribe({
      next: r => {
        this.users.set(r.data ?? [])
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
      email: raw.email!,
      role: raw.role!,
      password: raw.password!,
    }

    const current = this.isEditing() ? (this.form.value as any) : null

    const req$ = current
      ? this.service.update({ ...(dto as any), id: current.id })
      : this.service.update(dto as any)

    req$.subscribe({
      next: () => {
        this.form.reset()
        this.load()
      },
      error: () => this.loading.set(false),
    })
  }

  ngOnInit() {
    this.auth.validateToken().subscribe({
      next: u => this.isAdmin.set(u.role === 'ADMIN'),
      error: () => this.isAdmin.set(false),
    })

    this.fields.set(this.buildFields())
    this.load()
  }
}
