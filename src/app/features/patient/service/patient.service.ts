import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { Observable } from 'rxjs';
import { ResultDto } from '../../../shared/model/result-dto';
import { PatientDto } from  '../model/patient-dto.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private api = inject(ApiService);
  private base = 'patient';

  getAll(): Observable<ResultDto<PatientDto[]>> {
    return this.api.get<ResultDto<PatientDto[]>>(`${this.base}/get-all-patients`);
  }

  getById(id: number): Observable<ResultDto<PatientDto>> {
    return this.api.get<ResultDto<PatientDto>>(`${this.base}/get-patient-by-id/${id}`);
  }

  create(dto: PatientDto): Observable<ResultDto<PatientDto>> {
    return this.api.post<ResultDto<PatientDto>>(`${this.base}/create-patient`, dto);
  }

  update(id: number, dto: PatientDto): Observable<ResultDto<PatientDto>> {
    return this.api.post<ResultDto<PatientDto>>(`${this.base}/update-patient/${id}`, dto);
  }

  delete(id: number): Observable<ResultDto<String>> {
    return this.api.delete<ResultDto<String>>(`${this.base}/delete-patient/${id}`);
  }
}
