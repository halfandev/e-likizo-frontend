
export interface LeaveType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  defaultDays: number;
  requiresDocument: boolean;
  active: boolean;
}

export interface LeaveTypeRequest {
  code: string;
  name: string;
  description: string | null;
  defaultDays: number;
  requiresDocument: boolean;
}
