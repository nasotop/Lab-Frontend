import { TestBed } from '@angular/core/testing';
import { OrderService } from './order.service';
import { ApiService } from '../../../core/http/api.service';
import { of } from 'rxjs';
import { OrderDto } from '../model/order-dto.model';
import { ResultDto } from '../../../shared/model/result-dto';

class MockApiService {
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
}

describe('OrderService', () => {
  let service: OrderService;
  let apiService: MockApiService;

  const baseUrl = 'order';
  const mockOrder: OrderDto = { id: 1, patientId: 100, notes: 'Test Order' } as OrderDto;
  const mockResult: ResultDto<OrderDto> = { data: mockOrder, success: true, errorMessage: null };
  const mockResultArray: ResultDto<OrderDto[]> = { data: [mockOrder], success: true, errorMessage: null };
  const mockDeleteResult: ResultDto<string> = { data: 'Deleted', success: true, errorMessage: null };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: ApiService, useClass: MockApiService }
      ]
    });

    service = TestBed.inject(OrderService);
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getAll with correct url', (done) => {
    const expectedUrl = `${baseUrl}/all`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getAll().subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getById with correct url', (done) => {
    const id = 123;
    const expectedUrl = `${baseUrl}/${id}`;
    apiService.get.and.returnValue(of(mockResult));

    service.getById(id).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getByPatient with correct url', (done) => {
    const patientId = 55;
    const expectedUrl = `${baseUrl}/by-patient/${patientId}`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getByPatient(patientId).subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call create with correct url and payload', (done) => {
    const expectedUrl = `${baseUrl}/create`;
    apiService.post.and.returnValue(of(mockResult));

    service.create(mockOrder).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockOrder);
  });

  it('should call update with correct url and payload', (done) => {
    const expectedUrl = `${baseUrl}/update`;
    apiService.post.and.returnValue(of(mockResult));

    service.update(mockOrder).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockOrder);
  });

  it('should call delete with correct url', (done) => {
    const id = 99;
    const expectedUrl = `${baseUrl}/delete/${id}`;
    apiService.delete.and.returnValue(of(mockDeleteResult));

    service.delete(id).subscribe(res => {
      expect(res).toEqual(mockDeleteResult);
      done();
    });

    expect(apiService.delete).toHaveBeenCalledWith(expectedUrl);
  });
});