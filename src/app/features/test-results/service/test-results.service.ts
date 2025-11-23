import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Observable } from 'rxjs';
import { TestResultDto } from '../model/test-result.dto';
import { ResultDto } from '../../../shared/model/result-dto';
import { CreateTestResultRequest } from '../model/create-test-result-request';

@Injectable({
  providedIn: 'root',
})
export class TestResultsService {
  private readonly http = inject(ApiService);



create(dto: CreateTestResultRequest) {
  return this.http.post('test-results', dto);
}

update(id: number, dto: CreateTestResultRequest) {
  return this.http.put(`test-results/${id}`, dto);
}

  delete(id: number): Observable<ResultDto<TestResultDto>> {
    return this.http.delete(`test-results/${id}`);
  }

  getAll(): Observable<ResultDto<TestResultDto[]>> {
    return this.http.get('test-results');
  }

  getById(id: number): Observable<ResultDto<TestResultDto>> {
    return this.http.get(`test-results/${id}`, undefined);
  }

  getByOrderTestId(orderTestId: number): Observable<ResultDto<TestResultDto>> {
    return this.http.get(`test-results/order-test/${orderTestId}`, undefined);
  }

  getByStatus(status: string): Observable<ResultDto<TestResultDto[]>> {
    return this.http.get(`test-results/status/${status}`, undefined);
  }
  getTestStatuses(): Observable<ResultDto<string[]>> {
    return this.http.get('test-results/status', undefined);
  }
}
