import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { ApiService } from '../../../core/http/api.service';
import { of } from 'rxjs';
import { UserDto } from '../model/user.model';
import { ResultDto } from '../../../shared/model/result-dto';

class MockApiService {
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
}

describe('UserService', () => {
  let service: UserService;
  let apiService: MockApiService;

  const baseUrl = 'user';
  const mockUser: UserDto = { id: 1, name: 'Admin User', role: 'ADMIN' } as UserDto;
  const mockResult: ResultDto<UserDto> = { data: mockUser, success: true, errorMessage: null };
  const mockResultArray: ResultDto<UserDto[]> = { data: [mockUser], success: true, errorMessage: null };
  const mockDeleteResult: ResultDto<string> = { data: 'Deleted', success: true, errorMessage: null };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiService, useClass: MockApiService }
      ]
    });

    service = TestBed.inject(UserService);
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
    const id = 10;
    const expectedUrl = `${baseUrl}/${id}`;
    apiService.get.and.returnValue(of(mockResult));

    service.getById(id).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call update with correct url and payload', (done) => {
    const expectedUrl = `${baseUrl}/update`;
    apiService.post.and.returnValue(of(mockResult));

    service.update(mockUser).subscribe(res => {
      expect(res).toEqual(mockResult);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(expectedUrl, mockUser);
  });

  it('should call delete with correct url', (done) => {
    const id = 5;
    const expectedUrl = `${baseUrl}/delete/${id}`;
    apiService.delete.and.returnValue(of(mockDeleteResult));

    service.delete(id).subscribe(res => {
      expect(res).toEqual(mockDeleteResult);
      done();
    });

    expect(apiService.delete).toHaveBeenCalledWith(expectedUrl);
  });

  it('should call getByRole with correct url', (done) => {
    const role = 'ADMIN';
    const expectedUrl = `${baseUrl}/get-by-role/${role}`;
    apiService.get.and.returnValue(of(mockResultArray));

    service.getByRole(role).subscribe(res => {
      expect(res).toEqual(mockResultArray);
      done();
    });

    expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
  });
});