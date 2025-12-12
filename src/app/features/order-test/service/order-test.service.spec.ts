import { TestBed } from '@angular/core/testing';
import { OrderTestService } from './order-test.service';
import { ApiService } from '../../../core/http/api.service';
import { of } from 'rxjs';
import { OrderTestDto } from '../model/order-test-dto.model';
import { ResultDto } from '../../../shared/model/result-dto';

class MockApiService {
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
}

describe('OrderTestService', () => {
  let service: OrderTestService;
  let apiService: MockApiService;

  const baseUrl = 'order-test';
  const mockDto: OrderTestDto = { id: 1, orderId: 100, laboratoryId: 50 } as OrderTestDto;
  const mockResult: ResultDto<OrderTestDto> = { data: mockDto, success: true, errorMessage: null };
  const mockResultArray: ResultDto<OrderTestDto[]> = { data: [mockDto], success: true, errorMessage: null };
  const mockDeleteResult: ResultDto<string> = { data: 'Deleted', success: true, errorMessage: null };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderTestService,
        { provide: ApiService, useClass: MockApiService }
      ]
    });

    service = TestBed.inject(OrderTestService);
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getAll with correct url', (done) => {
    const expectedUrl = `${baseUrl}/get-all-order-tests`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getAll().subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getById with correct url', (done) => {
    const id = 10;
    const expectedUrl = `${baseUrl}/get-order-test-by-id/${id}`;
    apiService.get.and.returnValue(of(mockResult));

    service.getById(id).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getByOrderId with correct url', (done) => {
    const orderId = 55;
    const expectedUrl = `${baseUrl}/get-order-tests-by-order-id/${orderId}`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getByOrderId(orderId).subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call create with correct url and payload', (done) => {
    const expectedUrl = `${baseUrl}/create-order-test`;
    apiService.post.and.returnValue(of(mockResult));

    service.create(mockDto).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockDto);
  });

  it('should call update with correct url and payload', (done) => {
    const id = 1;
    const expectedUrl = `${baseUrl}/update-order-test/${id}`;
    apiService.post.and.returnValue(of(mockResult));

    service.update(id, mockDto).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockDto);
  });

  it('should call delete with correct url', (done) => {
    const id = 99;
    const expectedUrl = `${baseUrl}/delete-order-test/${id}`;
    apiService.delete.and.returnValue(of(mockDeleteResult));

    service.delete(id).subscribe(res => {
      expect(res).toEqual(mockDeleteResult);
      done();
    });

    expect(apiService.delete).toHaveBeenCalledWith(expectedUrl);
  });
});