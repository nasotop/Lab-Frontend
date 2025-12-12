import { TestBed } from '@angular/core/testing';
import { PatientService } from './patient.service';
import { ApiService } from '../../../core/http/api.service';
import { of } from 'rxjs';
import { PatientDto } from '../model/patient-dto.model';
import { ResultDto } from '../../../shared/model/result-dto';

class MockApiService {
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
}

describe('PatientService', () => {
  let service: PatientService;
  let apiService: MockApiService;

  const baseUrl = 'patient';
  const mockDto: PatientDto = { id: 1, fullName: 'John Doe' } as PatientDto;
  const mockResult: ResultDto<PatientDto> = { data: mockDto, success: true, errorMessage: null };
  const mockResultArray: ResultDto<PatientDto[]> = { data: [mockDto], success: true, errorMessage: null };
  const mockDeleteResult: ResultDto<string> = { data: 'Deleted', success: true, errorMessage: null };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientService,
        { provide: ApiService, useClass: MockApiService }
      ]
    });

    service = TestBed.inject(PatientService);
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getAll with correct url', (done) => {
    const expectedUrl = `${baseUrl}/get-all-patients`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getAll().subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getById with correct url', (done) => {
    const id = 10;
    const expectedUrl = `${baseUrl}/get-patient-by-id/${id}`;
    apiService.get.and.returnValue(of(mockResult));

    service.getById(id).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call create with correct url and payload', (done) => {
    const expectedUrl = `${baseUrl}/create-patient`;
    apiService.post.and.returnValue(of(mockResult));

    service.create(mockDto).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockDto);
  });

  it('should call update with correct url and payload', (done) => {
    const id = 5;
    const expectedUrl = `${baseUrl}/update-patient/${id}`;
    apiService.post.and.returnValue(of(mockResult));

    service.update(id, mockDto).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockDto);
  });

  it('should call delete with correct url', (done) => {
    const id = 99;
    const expectedUrl = `${baseUrl}/delete-patient/${id}`;
    apiService.delete.and.returnValue(of(mockDeleteResult));

    service.delete(id).subscribe(res => {
      expect(res).toEqual(mockDeleteResult);
      done();
    });

    expect(apiService.delete).toHaveBeenCalledWith(expectedUrl);
  });
});