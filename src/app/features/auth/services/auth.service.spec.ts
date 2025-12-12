import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../../../core/http/api.service';
import { TokenService } from '../../../core/http/token.service';
import { of, throwError } from 'rxjs';
import { LoginRequest } from '../model/login-request';
import { ResultDto } from '../../../shared/model/result-dto';
import { LoginResponse } from '../model/login-response';
import { UserDto } from '../model/user.dto';
import { RegisterRequest } from '../model/register-request';

class MockApiService {
  post = jasmine.createSpy('post').and.returnValue(of({}));
}

class MockTokenService {
  get = jasmine.createSpy('get');
  set = jasmine.createSpy('set');
  clear = jasmine.createSpy('clear');
}

describe('AuthService', () => {
  let service: AuthService;
  let apiService: MockApiService;
  let tokenService: MockTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useClass: MockApiService },
        { provide: TokenService, useClass: MockTokenService },
      ],
    });

    service = TestBed.inject(AuthService);
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
    tokenService = TestBed.inject(TokenService) as unknown as MockTokenService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should call api.post with correct url and request', (done) => {
    const request: LoginRequest = { email: 'test@test.com', password: '123' };
    const mockResponse: ResultDto<LoginResponse> = {
      success: true,
      data: { token: 'abc', userDto: { id: 1, email: 'test', role: 'USER' } as UserDto },
      errorMessage: null,
    };
    apiService.post.and.returnValue(of(mockResponse));

    service.login(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(
      'authentication/login',
      request
    );
  });

  it('register should call api.post with correct url and request', (done) => {
    const request: RegisterRequest = {
      id: 1,
      name: 'Test',
      email: 'test@test.com',
      password: '123',
      role: 'USER',
    };
    const mockResponse: ResultDto<unknown> = {
      success: true,
      data: null,
      errorMessage: null,
    };
    apiService.post.and.returnValue(of(mockResponse));

    service.register(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith(
      'authentication/register',
      request
    );
  });

  it('recovery should call api.post with correct url and email object', (done) => {
    const email = 'test@test.com';
    apiService.post.and.returnValue(of({ success: true }));

    service.recovery(email).subscribe(() => {
      done();
    });

    expect(apiService.post).toHaveBeenCalledWith('authentication/recovery', {
      email,
    });
  });

  it('logout should call tokenService.clear', () => {
    service.logout();
    expect(tokenService.clear).toHaveBeenCalled();
  });

  it('saveToken should call tokenService.set', () => {
    const token = 'abc-123';
    service.saveToken(token);
    expect(tokenService.set).toHaveBeenCalledWith(token);
  });

  it('validateToken should throw NO_TOKEN if tokenService returns null', (done) => {
    tokenService.get.and.returnValue(null);

    service.validateToken().subscribe({
      error: (err) => {
        expect(err).toBe('NO_TOKEN');
        done();
      },
    });

    expect(apiService.post).not.toHaveBeenCalled();
  });

  it('validateToken should throw INVALID_TOKEN if api response success is false', (done) => {
    tokenService.get.and.returnValue('valid-token');
    const mockResponse: ResultDto<UserDto> = {
      success: false,
      data: null,
      errorMessage: 'Error',
    };
    apiService.post.and.returnValue(of(mockResponse));

    service.validateToken().subscribe({
      error: (err) => {
        expect(err).toBe('INVALID_TOKEN');
        done();
      },
    });

    expect(apiService.post).toHaveBeenCalledWith(
      'authentication/validate',
      null,
      jasmine.objectContaining({ Authorization: 'Bearer valid-token' })
    );
  });

  it('validateToken should return user data if api response is successful', (done) => {
    tokenService.get.and.returnValue('valid-token');
    const mockUser: UserDto = { id: 1, email: 'test', role: 'USER' } as UserDto;
    const mockResponse: ResultDto<UserDto> = {
      success: true,
      data: mockUser,
      errorMessage: null,
    };
    apiService.post.and.returnValue(of(mockResponse));

    service.validateToken().subscribe((user) => {
      expect(user).toEqual(mockUser);
      done();
    });
  });
});
