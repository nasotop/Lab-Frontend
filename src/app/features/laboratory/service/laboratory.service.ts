import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Observable } from 'rxjs';
import { ResultDto } from '../../../shared/model/result-dto';
import { LaboratoryDto } from '../model/laboratory-dto.model';

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  private readonly api = inject(ApiService);
  private readonly base = 'laboratory';

  getAll(): Observable<ResultDto<LaboratoryDto[]>> {
    return this.api.get<ResultDto<LaboratoryDto[]>>(`${this.base}/all`);
  }

  getById(id: number): Observable<ResultDto<LaboratoryDto>> {
    return this.api.get<ResultDto<LaboratoryDto>>(`${this.base}/${id}`);
  }

  create(dto: LaboratoryDto): Observable<ResultDto<LaboratoryDto>> {
    return this.api.post<ResultDto<LaboratoryDto>>(`${this.base}/create`, dto);
  }

  update(dto: LaboratoryDto): Observable<ResultDto<LaboratoryDto>> {
    return this.api.post<ResultDto<LaboratoryDto>>(`${this.base}/update`, dto);
  }

  delete(id: number): Observable<ResultDto<string>> {
    return this.api.delete<ResultDto<string>>(`${this.base}/delete/${id}`);
  }

  getBySpecialization(sp: string): Observable<ResultDto<LaboratoryDto[]>> {
    return this.api.get<ResultDto<LaboratoryDto[]>>(
      `${this.base}/by-specialization/${sp}`
    );
  }
}
