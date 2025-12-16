import { Injectable, inject } from '@angular/core'
import { ApiService } from '../../../core/http/api.service'
import { Observable } from 'rxjs'
import { ResultDto } from '../../../shared/model/result-dto'
import { TestTypeDto } from '../model/test-type-dto.model'

@Injectable({ providedIn: 'root' })
export class TestTypeService {
  private readonly api = inject(ApiService)
  private readonly base = 'test-type'

  getAll(): Observable<ResultDto<TestTypeDto[]>> {
    return this.api.get<ResultDto<TestTypeDto[]>>(`${this.base}/get-all-test-types`)
  }

  getById(id: number): Observable<ResultDto<TestTypeDto>> {
    return this.api.get<ResultDto<TestTypeDto>>(`${this.base}/get-test-type-by-id/${id}`)
  }

  getBySpecialization(sp: string): Observable<ResultDto<TestTypeDto[]>> {
    return this.api.get<ResultDto<TestTypeDto[]>>(
      `${this.base}/get-test-types-by-specialization/${sp}`
    )
  }

  create(dto: TestTypeDto): Observable<ResultDto<TestTypeDto>> {
    return this.api.post<ResultDto<TestTypeDto>>(`${this.base}/create-test-type`, dto)
  }

  update(id: number, dto: TestTypeDto): Observable<ResultDto<TestTypeDto>> {
    return this.api.post<ResultDto<TestTypeDto>>(`${this.base}/update-test-type/${id}`, dto)
  }

  delete(id: number): Observable<ResultDto<string>> {
    return this.api.delete<ResultDto<string>>(`${this.base}/delete-test-type/${id}`)
  }
}
