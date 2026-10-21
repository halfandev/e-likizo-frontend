
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  LeaveType,
  LeaveTypeRequest
} from '../models/leave-type.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {

  private readonly adminUrl =
    'http://localhost:8080/api/admin/leave-types';

  private readonly employeeUrl =
    'http://localhost:8080/api/leaves/types';

  constructor(private http: HttpClient) {}

  // Admin: kupata aina zote, pamoja na inactive
  getAll(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(this.adminUrl);
  }

  // Employee: kupata aina zilizo active
  getActive(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(this.employeeUrl);
  }

  // Admin: kupata aina moja
  getById(id: number): Observable<LeaveType> {
    return this.http.get<LeaveType>(
      `${this.adminUrl}/${id}`
    );
  }

  // Admin: kuongeza aina mpya
  create(request: LeaveTypeRequest): Observable<LeaveType> {
    return this.http.post<LeaveType>(
      this.adminUrl,
      request
    );
  }

  // Admin: kusasisha aina iliyopo
  update(
    id: number,
    request: LeaveTypeRequest
  ): Observable<LeaveType> {
    return this.http.put<LeaveType>(
      `${this.adminUrl}/${id}`,
      request
    );
  }

  // Admin: kuzima aina ya likizo
  deactivate(id: number): Observable<LeaveType> {
    return this.http.patch<LeaveType>(
      `${this.adminUrl}/${id}/deactivate`,
      {}
    );
  }

  // Admin: kuwasha tena aina ya likizo
  activate(id: number): Observable<LeaveType> {
    return this.http.patch<LeaveType>(
      `${this.adminUrl}/${id}/activate`,
      {}
    );
  }
}
