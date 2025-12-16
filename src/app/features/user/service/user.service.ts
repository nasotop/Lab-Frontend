import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Observable } from 'rxjs';
import { ResultDto } from '../../../shared/model/result-dto';
import { UserDto } from '../model/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly base = 'user';

  getAll(): Observable<ResultDto<UserDto[]>> {
    return this.api.get<ResultDto<UserDto[]>>(`${this.base}/all`);
  }

  getById(id: number): Observable<ResultDto<UserDto>> {
    return this.api.get<ResultDto<UserDto>>(`${this.base}/${id}`);
  }

  update(dto: UserDto): Observable<ResultDto<UserDto>> {
    return this.api.post<ResultDto<UserDto>>(`${this.base}/update`, dto);
  }

  delete(id: number): Observable<ResultDto<string>> {
    return this.api.delete<ResultDto<string>>(`${this.base}/delete/${id}`);
  }
  getByRole(role: string): Observable<ResultDto<UserDto[]>> {
    return this.api.get<ResultDto<UserDto[]>>(
      `${this.base}/get-by-role/${role}`
    );
  }
}
