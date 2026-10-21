
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  LeaveApplication,
  LeaveApplicationRequest
} from '../models/leave-application.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveApplicationService {

  private readonly employeeUrl =
    'http://localhost:8080/api/leaves';

  private readonly adminUrl =
    'http://localhost:8080/api/admin/leaves';

  constructor(private http: HttpClient) {}

  // Mfanyakazi kuomba likizo.
  // Backend itamtambua mfanyakazi kupitia JWT token.
  applyForLeave(
    request: LeaveApplicationRequest
  ): Observable<LeaveApplication> {

    return this.http.post<LeaveApplication>(
      `${this.employeeUrl}/apply`,
      request
    );
  }

  // Mfanyakazi kuona maombi yake mwenyewe.
  getEmployeeApplications(): Observable<LeaveApplication[]> {

    return this.http.get<LeaveApplication[]>(
      `${this.employeeUrl}/my-applications`
    );
  }

  // Admin kuona maombi yote.
  getAllApplications(): Observable<LeaveApplication[]> {

    return this.http.get<LeaveApplication[]>(
      this.adminUrl
    );
  }

  // Admin kuanza kupitia ombi.
  markUnderReview(
    applicationId: number
  ): Observable<LeaveApplication> {

    return this.http.patch<LeaveApplication>(
      `${this.adminUrl}/${applicationId}/review`,
      {}
    );
  }

  // Admin kuidhinisha ombi.
  approveApplication(
    applicationId: number
  ): Observable<LeaveApplication> {

    return this.http.patch<LeaveApplication>(
      `${this.adminUrl}/${applicationId}/approve`,
      {}
    );
  }

  // Admin kukataa ombi.
  rejectApplication(
    applicationId: number
  ): Observable<LeaveApplication> {

    return this.http.patch<LeaveApplication>(
      `${this.adminUrl}/${applicationId}/reject`,
      {}
    );
  }
}
