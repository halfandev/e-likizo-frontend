import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LeaveApplication } from '../models/leave-application.model';

export interface WorkflowActionRequest {
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class RpcLeaveService {

  private apiUrl = 'http://localhost:8080/api/leaves';

  constructor(private http: HttpClient) {}

  // Maombi yanayosubiri RPC
  getRPCApplications(): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(
      `${this.apiUrl}/rpc/inbox`
    );
  }

  // RPC ana-approve au kupeleka ombi hatua inayofuata
  approveApplication(
    applicationId: number,
    comment: string
  ): Observable<LeaveApplication> {

    const request: WorkflowActionRequest = { comment };

    return this.http.post<LeaveApplication>(
      `${this.apiUrl}/rpc/${applicationId}/approve`,
      request
    );
  }

  // RPC anakataa ombi
  rejectApplication(
    applicationId: number,
    comment: string
  ): Observable<LeaveApplication> {

    const request: WorkflowActionRequest = { comment };

    return this.http.post<LeaveApplication>(
      `${this.apiUrl}/rpc/${applicationId}/reject`,
      request
    );
  }

  // Maombi yaliyokamilika katika Region
  getApprovedApplications(): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(
      `${this.apiUrl}/rpc/approved`
    );
  }

  // Maombi yaliyokataliwa katika Region
  getRejectedApplications(): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(
      `${this.apiUrl}/rpc/rejected`
    );
  }
}