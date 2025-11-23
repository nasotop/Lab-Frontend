export interface ResultDto<T> {
  success: boolean;
  data: T | null;
  errorMessage: string | null;
}