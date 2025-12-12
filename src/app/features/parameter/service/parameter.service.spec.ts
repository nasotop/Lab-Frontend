import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ParameterService } from './parameter.service';
import { ApiService } from '../../../core/http/api.service';
import { Observable, of } from 'rxjs';
import { ResultDto } from '../../../shared/model/result-dto';
import { ParameterDto } from '../model/parameter.model';

// Definición de un mock simple para ApiService
// El servicio ParameterService usa la función inject, por lo que ApiService debe ser un Injectable.
// Lo más sencillo es proveer un mock en el TestBed.
class MockApiService {
  get<T>(url: string): Observable<T> {
    // Retorna un observable mockeado. La implementación no es relevante aquí,
    // ya que HttpTestingController se encarga de verificar la URL y el método HTTP.
    return of({} as T);
  }
}

describe('ParameterService', () => {
  let service: ParameterService;
  let httpMock: HttpTestingController;
  let apiService: ApiService; // Para inyectar el mock

  const baseUrl = 'parameter';

  // Datos mockeados para las respuestas
  const mockParameterData: ResultDto<ParameterDto[]> = {
    data: [{ value: 1, description: 'Status A' }],
    success: true,
    errorMessage: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ParameterService,
        // Proveer el mock de ApiService
        { provide: ApiService, useClass: MockApiService }
      ]
    });

    service = TestBed.inject(ParameterService);
    // Usamos el ApiService mockeado para espiar su método 'get'
    apiService = TestBed.inject(ApiService); 
    httpMock = TestBed.inject(HttpTestingController);
    
    // Espiar el método 'get' del ApiService para verificar las llamadas
    spyOn(apiService, 'get').and.returnValue(of(mockParameterData));
  });

  afterEach(() => {
    // Asegurar que no haya peticiones HTTP pendientes (aunque estamos mockeando apiService)
    httpMock.verify();
  });

  // --- 1. Inicialización ---
  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });
  
  // --- 2. Métodos de Llamada a API ---

  it('debería llamar a api.get con la URL correcta para getOrderStatus', (done) => {
    const expectedUrl = `${baseUrl}/get-order-status`;

    service.getOrderStatus().subscribe(response => {
      // Opcional: Verificar que el servicio retorna algo (aunque el test principal es la URL)
      expect(response).toEqual(mockParameterData); 
      done();
    });

    // Verificar que el método 'get' de ApiService fue llamado con la URL esperada
    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('debería llamar a api.get con la URL correcta para getPriorities', (done) => {
    const expectedUrl = `${baseUrl}/get-priorities`;

    service.getPriorities().subscribe(response => {
      expect(response).toEqual(mockParameterData);
      done();
    });
    
    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('debería llamar a api.get con la URL correcta para getSpecializations', (done) => {
    const expectedUrl = `${baseUrl}/get-specializations`;

    service.getSpecializations().subscribe(response => {
      expect(response).toEqual(mockParameterData);
      done();
    });
    
    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('debería llamar a api.get con la URL correcta para getTestStatus', (done) => {
    const expectedUrl = `${baseUrl}/get-test-status`;

    service.getTestStatus().subscribe(response => {
      expect(response).toEqual(mockParameterData);
      done();
    });
    
    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });
});