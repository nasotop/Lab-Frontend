// login.service.ts
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { LoginRequest } from '../model/login-request';
import { RegisterRequest } from '../model/register-request';
import { TokenService } from '../../../core/http/token.service';
import { map, Observable, throwError } from 'rxjs';
import { ResultDto } from '../../../shared/model/result-dto';
import { LoginResponse } from '../model/login-response';
import { UserDto } from '../model/user.dto';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(ApiService);
  private readonly tokenService = inject(TokenService);

  login(request: LoginRequest): Observable<ResultDto<LoginResponse>> {
    return this.http.post<ResultDto<LoginResponse>>(
      'authentication/login',
      request
    );
  }

  register(request: RegisterRequest) {
    return this.http.post('authentication/register', request);
  }

  recovery(email: string) {
    return this.http.post('authentication/recovery', { email });
  }

  logout() {
    this.tokenService.clear();
  }
  saveToken(token: string) {
    this.tokenService.set(token);
  }

  validateToken(): Observable<UserDto> {
    const raw = this.tokenService.get();
    if (!raw) return throwError(() => 'NO_TOKEN');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${raw}`,
    };
    return this.http
      .post<ResultDto<UserDto>>('authentication/validate', null, headers)
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw 'INVALID_TOKEN';
          return r.data;
        })
      );
  }
}
