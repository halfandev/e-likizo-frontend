
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  employeeId: number | null;
  fullName: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // LOGIN
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        sessionStorage.setItem('token', response.token);

        sessionStorage.setItem('user', JSON.stringify({
          userId: response.userId,
          employeeId: response.employeeId,
          fullName: response.fullName,
          email: response.email,
          role: response.role,
          mustChangePassword: response.mustChangePassword
        }));
      })
    );
  }

  // REGISTER
  register(request: RegisterRequest): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/register`,
      request,
      { responseType: 'text' }
    );
  }

  // GET TOKEN
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  // GET CURRENT USER
  getUser(): LoginResponse | null {
    const user = sessionStorage.getItem('user');

    return user ? JSON.parse(user) as LoginResponse : null;
  }

  // GET EMPLOYEE ID
  getEmployeeId(): number | null {
    return this.getUser()?.employeeId ?? null;
  }

  // LOGOUT
  logout(): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { responseType: 'text' }
    ).pipe(
      finalize(() => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      })
    );
  }

  // CHECK LOGIN
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // FORGOT PASSWORD
  forgotPassword(
    request: ForgotPasswordRequest
  ): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${this.apiUrl}/forgot-password`,
      request
    );
  }

  // RESET PASSWORD
  resetPassword(
    request: ResetPasswordRequest
  ): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${this.apiUrl}/reset-password`,
      request
    );
  }

  // CHANGE PASSWORD
  changePassword(
    request: ChangePasswordRequest
  ): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/change-password`,
      request,
      { responseType: 'text' }
    );
  }
}
