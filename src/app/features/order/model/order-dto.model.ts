import { PatientDto } from '../../patient/model/patient-dto.model';

export interface OrderDto {
  id: number;
  patient: PatientDto;
  patientId: number;
  orderedAt: string;
  status: string;
  notes: string;
}
