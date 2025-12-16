import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderTestDto } from '../model/order-test-dto.model';
import { ResultDto } from '../../../shared/model/result-dto';
import { ApiService } from '../../../core/http/api.service';

@Injectable({ providedIn: 'root' })
export class OrderTestService {
  private readonly http = inject(ApiService);
  private readonly baseUrl = 'order-test';

  getAll(): Observable<ResultDto<OrderTestDto[]>> {
    return this.http.get<ResultDto<OrderTestDto[]>>(
      `${this.baseUrl}/get-all-order-tests`
    );
  }

  getById(id: number): Observable<ResultDto<OrderTestDto>> {
    return this.http.get<ResultDto<OrderTestDto>>(
      `${this.baseUrl}/get-order-test-by-id/${id}`
    );
  }

  getByOrderId(orderId: number): Observable<ResultDto<OrderTestDto[]>> {
    return this.http.get<ResultDto<OrderTestDto[]>>(
      `${this.baseUrl}/get-order-tests-by-order-id/${orderId}`
    );
  }

  create(dto: OrderTestDto): Observable<ResultDto<OrderTestDto>> {
    return this.http.post<ResultDto<OrderTestDto>>(
      `${this.baseUrl}/create-order-test`,
      dto
    );
  }

  update(id: number, dto: OrderTestDto): Observable<ResultDto<OrderTestDto>> {
    return this.http.post<ResultDto<OrderTestDto>>(
      `${this.baseUrl}/update-order-test/${id}`,
      dto
    );
  }

  delete(id: number): Observable<ResultDto<string>> {
    return this.http.delete<ResultDto<string>>(
      `${this.baseUrl}/delete-order-test/${id}`
    );
  }
}
