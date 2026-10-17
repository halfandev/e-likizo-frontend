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

  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        sessionStorage.setItem('token', response.token);

        sessionStorage.setItem(
          'user',
          JSON.stringify({
            userId: response.userId,
            fullName: response.fullName,
            email: response.email,
            role: response.role,
            mustChangePassword: response.mustChangePassword
          })
        );
      })
    );
  }

  register(request: RegisterRequest): Observable<string> {
  return this.http.post(
    `${this.apiUrl}/register`,
    request,
    { responseType: 'text' }
  );
}

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getUser(): LoginResponse | null {

    const user = sessionStorage.getItem('user');

    return user ? JSON.parse(user) as LoginResponse : null;
  }

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

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  forgotPassword(
  request: ForgotPasswordRequest
): Observable<ApiMessageResponse> {
  return this.http.post<ApiMessageResponse>(
    `${this.apiUrl}/forgot-password`,
    request
  );
}

resetPassword(
  request: ResetPasswordRequest
): Observable<ApiMessageResponse> {
  return this.http.post<ApiMessageResponse>(
    `${this.apiUrl}/reset-password`,
    request
  );
}


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
