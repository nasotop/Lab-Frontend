import { TestBed } from '@angular/core/testing';
import { TestTypeService } from './test-type.service';
import { ApiService } from '../../../core/http/api.service';
import { of } from 'rxjs';
import { TestTypeDto } from '../model/test-type-dto.model';
import { ResultDto } from '../../../shared/model/result-dto';

class MockApiService {
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
}

describe('TestTypeService', () => {
  let service: TestTypeService;
  let apiService: MockApiService;

  const baseUrl = 'test-type';
  const mockDto: TestTypeDto = { id: 1, name: 'Blood Count', code: 'Complete Blood Count' } as TestTypeDto;
  const mockResult: ResultDto<TestTypeDto> = { data: mockDto, success: true, errorMessage: null };
  const mockResultArray: ResultDto<TestTypeDto[]> = { data: [mockDto], success: true, errorMessage: null };
  const mockDeleteResult: ResultDto<string> = { data: 'Deleted', success: true, errorMessage: null };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestTypeService,
        { provide: ApiService, useClass: MockApiService }
      ]
    });

    service = TestBed.inject(TestTypeService);
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getAll with correct url', (done) => {
    const expectedUrl = `${baseUrl}/get-all-test-types`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getAll().subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getById with correct url', (done) => {
    const id = 10;
    const expectedUrl = `${baseUrl}/get-test-type-by-id/${id}`;
    apiService.get.and.returnValue(of(mockResult));

    service.getById(id).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getBySpecialization with correct url', (done) => {
    const spec = 'Hematology';
    const expectedUrl = `${baseUrl}/get-test-types-by-specialization/${spec}`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getBySpecialization(spec).subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call create with correct url and payload', (done) => {
    const expectedUrl = `${baseUrl}/create-test-type`;
    apiService.post.and.returnValue(of(mockResult));

    service.create(mockDto).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockDto);
  });

  it('should call update with correct url and payload', (done) => {
    const id = 5;
    const expectedUrl = `${baseUrl}/update-test-type/${id}`;
    apiService.post.and.returnValue(of(mockResult));

    service.update(id, mockDto).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockDto);
  });

  it('should call delete with correct url', (done) => {
    const id = 99;
    const expectedUrl = `${baseUrl}/delete-test-type/${id}`;
    apiService.delete.and.returnValue(of(mockDeleteResult));

    service.delete(id).subscribe(res => {
      expect(res).toEqual(mockDeleteResult);
      done();
    });

    expect(apiService.delete).toHaveBeenCalledWith(expectedUrl);
  });
});