import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  formatter?: (row: any) => string;
}

@Component({
  selector: 'app-entity-table',
  template: `
    <div class="table-responsive">
      <table class="table table-bordered table-striped mb-0">
        <thead class="table-light">
          <tr>
            @for (col of columns(); track col.key) {
            <th>{{ col.label }}</th>
            } @if (showActions()) {
            <th style="width: 150px;">Acciones</th>
            }
          </tr>
        </thead>

        <tbody>
          @for (row of data(); track row[idKey()]) {
          <tr>
            @for (col of columns(); track col.key) {
            <td>
              {{ col.formatter ? col.formatter(row) : row[col.key] }}
            </td>
            } @if (showActions()) {
            <td class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm btn-warning"
                (click)="edit.emit(row)"
              >
                Editar
              </button>

              <button
                type="button"
                class="btn btn-sm btn-danger"
                (click)="remove.emit(row[idKey()])"
              >
                Eliminar
              </button>
            </td>
            }
          </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityTableComponent {
  data = input.required<any[]>();
  columns = input.required<TableColumn[]>();
  idKey = input<string>('id');
  showActions = input<boolean>(true);

  edit = output<any>();
  remove = output<number>();
}
