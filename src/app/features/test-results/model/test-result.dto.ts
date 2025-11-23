export interface TestResultDto {
  id: number;
  orderTestId: number;
  collectedAt: string;
  processedAt: string;
  value: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  status: string;
}
