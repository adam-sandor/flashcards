export interface Sheet {
  id: string;
  name: string;
  webViewLink: string;
}

export interface SheetResponse {
  status: string;
  data: Record<string, string>;
}

export interface SheetsListResponse {
  status: string;
  data: Sheet[];
}

export interface SheetError {
  status: string;
  message: string;
} 