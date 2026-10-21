
export type LeaveStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface LeaveApplication {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason: string;
  status: LeaveStatus;
  familyMemberId: number | null;
}

export interface LeaveApplicationRequest {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  familyMemberId?: number | null;
}
