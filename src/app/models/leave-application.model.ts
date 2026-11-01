
export enum LeaveStatus {
  OCS = 'OCS',
  OCD = 'OCD',
  RPC = 'RPC',
  CP = 'CP',
  IGP = 'IGP',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}
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
