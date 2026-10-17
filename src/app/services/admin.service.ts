
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUserResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  enabled: boolean;
  mustChangePassword: boolean;
  lastLogin: string | null;
  lastLogout: string | null;
  createdAt: string | null;
}

export interface OnlineUserResponse {
  id: number;
  fullName: string;
  email: string;
  lastLogin: string;
  lastActivity: string;
  onlineDurationMinutes: number;
}

export interface AdminCreateUserRequest {
  fullName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(
      `${this.apiUrl}/users`
    );
  }

  getOnlineUsers(): Observable<OnlineUserResponse[]> {
    return this.http.get<OnlineUserResponse[]>(
      `${this.apiUrl}/users/online`
    );
  }

  createUser(
    request: AdminCreateUserRequest
  ): Observable<AdminUserResponse> {
    return this.http.post<AdminUserResponse>(
      `${this.apiUrl}/users/register`,
      request
    );
  }

  
disableUser(id: number): Observable<AdminUserResponse> {
  return this.http.patch<AdminUserResponse>(
    `${this.apiUrl}/users/${id}/disable`,
    {}
  );
}

enableUser(id: number): Observable<AdminUserResponse> {
  return this.http.patch<AdminUserResponse>(
    `${this.apiUrl}/users/${id}/enable`,
    {}
  );
}

}
