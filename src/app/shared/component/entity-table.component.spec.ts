import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityTableComponent } from './entity-table.component';
import { By } from '@angular/platform-browser';

describe('EntityTableComponent', () => {
  let component: EntityTableComponent;
  let fixture: ComponentFixture<EntityTableComponent>;

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@test.com', status: 'ACTIVE' },
    { id: 2, name: 'Jane Smith', email: 'jane@test.com', status: 'INACTIVE' }
  ];

  const mockColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    { key: 'status', label: 'Estado', formatter: (row: any) => row.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityTableComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct number of rows and columns', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);

    const headers = fixture.debugElement.queryAll(By.css('thead th'));
    expect(headers.length).toBe(4); 
  });

  it('should render cell data correctly', () => {
    const firstRowCells = fixture.debugElement.queryAll(By.css('tbody tr:first-child td'));
    expect(firstRowCells[0].nativeElement.textContent.trim()).toBe('John Doe');
    expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('john@test.com');
  });

  it('should use formatter function when provided', () => {
    const firstRowCells = fixture.debugElement.queryAll(By.css('tbody tr:first-child td'));
    const secondRowCells = fixture.debugElement.queryAll(By.css('tbody tr:nth-child(2) td'));

    expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('Activo');
    expect(secondRowCells[2].nativeElement.textContent.trim()).toBe('Inactivo');
  });

  it('should emit edit event with row data when edit button is clicked', () => {
    let emittedRow: any;
    component.edit.subscribe((row) => emittedRow = row);

    const editBtns = fixture.debugElement.queryAll(By.css('.btn-warning'));
    editBtns[0].nativeElement.click();

    expect(emittedRow).toEqual(mockData[0]);
  });

  it('should emit remove event with row id when delete button is clicked', () => {
    let emittedId: number | undefined;
    component.remove.subscribe((id) => emittedId = id);

    const deleteBtns = fixture.debugElement.queryAll(By.css('.btn-danger'));
    deleteBtns[1].nativeElement.click();

    expect(emittedId).toBe(2);
  });

  it('should hide actions column when showActions is false', () => {
    fixture.componentRef.setInput('showActions', false);
    fixture.detectChanges();

    const headers = fixture.debugElement.queryAll(By.css('thead th'));
    expect(headers.length).toBe(3); 

    const actionButtons = fixture.debugElement.queryAll(By.css('button'));
    expect(actionButtons.length).toBe(0);
  });

  it('should use custom idKey for deletion', () => {
    const customData = [{ userId: 100, name: 'Test' }];
    fixture.componentRef.setInput('data', customData);
    fixture.componentRef.setInput('idKey', 'userId');
    fixture.detectChanges();

    let emittedId: number | undefined;
    component.remove.subscribe((id) => emittedId = id);

    const deleteBtn = fixture.debugElement.query(By.css('.btn-danger'));
    deleteBtn.nativeElement.click();

    expect(emittedId).toBe(100);
  });
});