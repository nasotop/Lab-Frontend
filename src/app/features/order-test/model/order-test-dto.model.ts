import { LaboratoryDto } from '../../laboratory/model/laboratory-dto.model';
import { OrderDto } from '../../order/model/order-dto.model';
import { TestTypeDto } from '../../test-type/model/test-type-dto.model';

export interface OrderTestDto {
  id?: number;
  orderId: number ; 
  testTypeId: number ;
  laboratoryId: number ;
  priority: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
}
