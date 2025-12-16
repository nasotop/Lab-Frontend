import { Injectable, inject } from '@angular/core'
import { ApiService } from '../../../core/http/api.service'
import { Observable } from 'rxjs'
import { ResultDto } from '../../../shared/model/result-dto'
import { ParameterDto } from '../model/parameter.model'

@Injectable({ providedIn: 'root' })
export class ParameterService {
  private readonly api = inject(ApiService)
  private readonly base = 'parameter'

  getOrderStatus(): Observable<ResultDto<ParameterDto[]>> {
    return this.api.get<ResultDto<ParameterDto[]>>(`${this.base}/get-order-status`)
  }

  getPriorities(): Observable<ResultDto<ParameterDto[]>> {
    return this.api.get<ResultDto<ParameterDto[]>>(`${this.base}/get-priorities`)
  }

  getSpecializations(): Observable<ResultDto<ParameterDto[]>> {
    return this.api.get<ResultDto<ParameterDto[]>>(`${this.base}/get-specializations`)
  }

  getTestStatus(): Observable<ResultDto<ParameterDto[]>> {
    return this.api.get<ResultDto<ParameterDto[]>>(`${this.base}/get-test-status`)
  }
}
