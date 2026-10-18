
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeRequest } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  // 1. Kupata wafanyakazi wote (ADMIN/HR)
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // 2. Kupata mfanyakazi mmoja kwa ID
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // 3. Kusajili mfanyakazi mpya
  registerEmployee(
    employee: EmployeeRequest
  ): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // 4. Kubadilisha taarifa za mfanyakazi
  updateEmployee(
    id: number,
    employee: EmployeeRequest
  ): Observable<Employee> {
    return this.http.put<Employee>(
      `${this.apiUrl}/${id}`,
      employee
    );
  }

  // 5. Kufuta mfanyakazi
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 6. Kupata profile ya mfanyakazi aliyeingia
  getMyProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/me`);
  }
}
