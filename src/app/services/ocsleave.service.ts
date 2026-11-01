import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LeaveApplication } from '../models/leave-application.model';

export interface WorkflowActionRequest {
  comment: string;
}

export interface OcsDashboardCounts {
  waitingForOCS: number;
  waitingForRPC: number;
  waitingForCP: number;
  waitingForIGP: number;
}

@Injectable({
  providedIn: 'root'
})
export class OcsLeaveService {

  private apiUrl = 'http://localhost:8080/api/leaves';

  constructor(private http: HttpClient) {}

  getOCSApplications(): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(
      `${this.apiUrl}/ocs/inbox`
    );
  }

  forwardToOCD(
    applicationId: number,
    comment: string
  ): Observable<LeaveApplication> {

    const request: WorkflowActionRequest = { comment };

    return this.http.post<LeaveApplication>(
      `${this.apiUrl}/ocs/${applicationId}/forward`,
      request
    );
  }

  rejectApplication(
    applicationId: number,
    comment: string
  ): Observable<LeaveApplication> {

    const request: WorkflowActionRequest = { comment };

    return this.http.post<LeaveApplication>(
      `${this.apiUrl}/ocs/${applicationId}/reject`,
      request
    );
  }

  getOCSForwardedApplications(): Observable<LeaveApplication[]> {
  return this.http.get<LeaveApplication[]>(
    `${this.apiUrl}/ocs/forwarded`
  );
}

getOCSDashboardCounts(): Observable<OcsDashboardCounts> {
  return this.http.get<OcsDashboardCounts>(
    `${this.apiUrl}/ocs/dashboard-counts`
  );
}
}