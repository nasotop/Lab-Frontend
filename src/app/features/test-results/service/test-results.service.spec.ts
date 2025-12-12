import { TestBed } from '@angular/core/testing';
import { TestResultsService } from './test-results.service';
import { ApiService } from '../../../core/http/api.service';
import { of } from 'rxjs';
import { TestResultDto } from '../model/test-result.dto';
import { CreateTestResultRequest } from '../model/create-test-result-request';
import { ResultDto } from '../../../shared/model/result-dto';

class MockApiService {
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  put = jasmine.createSpy('put').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
}

describe('TestResultsService', () => {
  let service: TestResultsService;
  let apiService: MockApiService;

  const baseUrl = 'test-results';
  const mockDto: TestResultDto = { id: 1, interpretation: 'Positive' } as TestResultDto;
  const mockRequest: CreateTestResultRequest = { status: 'Positive', orderTestId: 10, value: '5.0' };
  const mockResult: ResultDto<TestResultDto> = { data: mockDto, success: true, errorMessage: null };
  const mockResultArray: ResultDto<TestResultDto[]> = { data: [mockDto], success: true, errorMessage: null };
  const mockStringArray: ResultDto<string[]> = { data: ['PENDING', 'COMPLETED'], success: true, errorMessage: null };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestResultsService,
        { provide: ApiService, useClass: MockApiService }
      ]
    });

    service = TestBed.inject(TestResultsService);
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call create with correct url and payload', (done) => {
    apiService.post.and.returnValue(of(mockResult));

    service.create(mockRequest).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(baseUrl, mockRequest);
  });

  it('should call update with correct url and payload', (done) => {
    const id = 1;
    const expectedUrl = `${baseUrl}/${id}`;
    apiService.put.and.returnValue(of(mockResult));

    service.update(id, mockRequest).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.put).toHaveBeenCalledWith(expectedUrl, mockRequest);
  });

  it('should call delete with correct url', (done) => {
    const id = 1;
    const expectedUrl = `${baseUrl}/${id}`;
    apiService.delete.and.returnValue(of(mockResult));

    service.delete(id).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.delete).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getAll with correct url', (done) => {
    apiService.get.and.returnValue(of(mockResultArray));

    service.getAll().subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(baseUrl);
  });

  it('should call getById with correct url', (done) => {
    const id = 5;
    const expectedUrl = `${baseUrl}/${id}`;
    apiService.get.and.returnValue(of(mockResult));

    service.getById(id).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getByOrderTestId with correct url', (done) => {
    const orderTestId = 20;
    const expectedUrl = `${baseUrl}/order-test/${orderTestId}`;
    apiService.get.and.returnValue(of(mockResult));

    service.getByOrderTestId(orderTestId).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getByStatus with correct url', (done) => {
    const status = 'COMPLETED';
    const expectedUrl = `${baseUrl}/status/${status}`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getByStatus(status).subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getTestStatuses with correct url', (done) => {
    const expectedUrl = `${baseUrl}/status`;
    apiService.get.and.returnValue(of(mockStringArray));

    service.getTestStatuses().subscribe(res => {
      expect(res).toEqual(mockStringArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });
});