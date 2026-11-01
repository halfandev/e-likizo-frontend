export interface LeaveWorkflowHistory {
  id: number;
  actorEmail: string;
  action: string;
  previousStatus: string | null;
  newStatus: string;
  comment: string;
  actionAt: string;
}

export interface LeaveWorkflowTracking {
  application: {
    id: number;
    employeeId: number;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    requestedDays: number;
    reason: string;
    status: string;
  };

  history: LeaveWorkflowHistory[];
}