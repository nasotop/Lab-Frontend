import { TestBed } from '@angular/core/testing';
import { LaboratoryService } from './laboratory.service';
import { ApiService } from '../../../core/http/api.service';
import { Observable, of } from 'rxjs';
import { ResultDto } from '../../../shared/model/result-dto';
import { LaboratoryDto } from '../model/laboratory-dto.model';

// Definición de un mock simple para ApiService
class MockApiService {
  // Los spies se encargarán de rastrear las llamadas
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
}

describe('LaboratoryService', () => {
  let service: LaboratoryService;
  let apiService: MockApiService;

  const baseUrl = 'laboratory';
  const mockLab: LaboratoryDto = { id: 1, name: 'Lab A', specialization: 'CHEMISTRY' } as LaboratoryDto;
  const mockResult: ResultDto<LaboratoryDto> = { data: mockLab, success: true, errorMessage: null };
  const mockResultArray: ResultDto<LaboratoryDto[]> = { data: [mockLab], success: true, errorMessage: null };
  const mockDeleteResult: ResultDto<string> = { data: 'Deleted', success: true, errorMessage: null };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LaboratoryService,
        // Proveer el mock del ApiService
        { provide: ApiService, useClass: MockApiService }
      ]
    });

    service = TestBed.inject(LaboratoryService);
    // Obtener la instancia del mock inyectado
    apiService = TestBed.inject(ApiService) as unknown as MockApiService; 
  });

  // --- 1. Inicialización ---
  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });
  
  // --- 2. Pruebas de Métodos GET ---

  it('getAll debería llamar a api.get con la URL "/all"', (done) => {
    const expectedUrl = `${baseUrl}/all`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getAll().subscribe(response => {
      expect(response).toEqual(mockResultArray); 
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
    expect(apiService.get).toHaveBeenCalledTimes(1);
  });

  it('getById debería llamar a api.get con la URL correcta para el ID', (done) => {
    const testId = 42;
    const expectedUrl = `${baseUrl}/${testId}`;
    apiService.get.and.returnValue(of(mockResult));

    service.getById(testId).subscribe(response => {
      expect(response).toEqual(mockResult);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });
  
  it('getBySpecialization debería llamar a api.get con la URL correcta para la especialización', (done) => {
    const specialization = 'CHEMISTRY';
    const expectedUrl = `${baseUrl}/by-specialization/${specialization}`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getBySpecialization(specialization).subscribe(response => {
      expect(response).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  // --- 3. Pruebas de Métodos POST ---

  it('create debería llamar a api.post con la URL "/create" y el DTO', (done) => {
    const expectedUrl = `${baseUrl}/create`;
    apiService.post.and.returnValue(of(mockResult));

    service.create(mockLab).subscribe(response => {
      expect(response).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockLab);
    expect(apiService.post).toHaveBeenCalledTimes(1);
  });

  it('update debería llamar a api.post con la URL "/update" y el DTO', (done) => {
    const expectedUrl = `${baseUrl}/update`;
    apiService.post.and.returnValue(of(mockResult));

    service.update(mockLab).subscribe(response => {
      expect(response).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockLab);
    expect(apiService.post).toHaveBeenCalledTimes(1);
  });

  // --- 4. Prueba de Método DELETE ---

  it('delete debería llamar a api.delete con la URL correcta para el ID', (done) => {
    const testId = 99;
    const expectedUrl = `${baseUrl}/delete/${testId}`;
    apiService.delete.and.returnValue(of(mockDeleteResult));

    service.delete(testId).subscribe(response => {
      expect(response).toEqual(mockDeleteResult);
      done();
    });

    expect(apiService.delete).toHaveBeenCalledWith(expectedUrl);
    expect(apiService.delete).toHaveBeenCalledTimes(1);
  });
});