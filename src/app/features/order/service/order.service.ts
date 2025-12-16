import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Observable } from 'rxjs';
import { ResultDto } from '../../../shared/model/result-dto';
import { OrderDto } from '../model/order-dto.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);
  private readonly base = 'order';

  getAll(): Observable<ResultDto<OrderDto[]>> {
    return this.api.get<ResultDto<OrderDto[]>>(`${this.base}/all`);
  }

  getById(id: number): Observable<ResultDto<OrderDto>> {
    return this.api.get<ResultDto<OrderDto>>(`${this.base}/${id}`);
  }

  getByPatient(patientId: number): Observable<ResultDto<OrderDto[]>> {
    return this.api.get<ResultDto<OrderDto[]>>(
      `${this.base}/by-patient/${patientId}`
    );
  }

  create(dto: OrderDto): Observable<ResultDto<OrderDto>> {
    return this.api.post<ResultDto<OrderDto>>(`${this.base}/create`, dto);
  }

  update(dto: OrderDto): Observable<ResultDto<OrderDto>> {
    return this.api.post<ResultDto<OrderDto>>(`${this.base}/update`, dto);
  }

  delete(id: number): Observable<ResultDto<string>> {
    return this.api.delete<ResultDto<string>>(`${this.base}/delete/${id}`);
  }
}
