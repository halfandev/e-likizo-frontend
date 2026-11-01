import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LeaveApplication } from '../models/leave-application.model';

export interface WorkflowActionRequest {
  comment: string;
}

export interface OcdDashboardCounts {
  waitingForOCD: number;
  waitingForRPC: number;
  waitingForCP: number;
  waitingForIGP: number;
}

@Injectable({
  providedIn: 'root'
})
export class OcdLeaveService {

  private apiUrl = 'http://localhost:8080/api/leaves';

  constructor(private http: HttpClient) {}

  // Maombi yanayosubiri OCD
  getOCDApplications(): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(
      `${this.apiUrl}/ocd/inbox`
    );
  }

  // Idadi ya maombi katika kila hatua
  getOCDDashboardCounts(): Observable<OcdDashboardCounts> {
    return this.http.get<OcdDashboardCounts>(
      `${this.apiUrl}/ocd/dashboard-counts`
    );
  }

  // OCD anapeleka ombi kwa RPC
  forwardToRPC(
    applicationId: number,
    comment: string
  ): Observable<LeaveApplication> {

    const request: WorkflowActionRequest = { comment };

    return this.http.post<LeaveApplication>(
      `${this.apiUrl}/ocd/${applicationId}/forward`,
      request
    );
  }

  // OCD anakataa ombi
  rejectApplication(
    applicationId: number,
    comment: string
  ): Observable<LeaveApplication> {

    const request: WorkflowActionRequest = { comment };

    return this.http.post<LeaveApplication>(
      `${this.apiUrl}/ocd/${applicationId}/reject`,
      request
    );
  }
}