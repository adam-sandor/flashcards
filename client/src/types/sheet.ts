export interface SheetResponse {
  status: string;
  data: Record<string, string>;
}

export interface SheetError {
  status: string;
  message: string;
} 