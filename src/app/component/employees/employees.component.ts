
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Employee } from 'src/app/models/employee.model';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  loading = false;
  errorMessage = '';
  searchTerm = '';

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data ?? [];
        this.applySearch();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load employees:', error);
        this.errorMessage =
          error.status === 403
            ? 'You are not authorized to view employees.'
            : 'Failed to load employees. Please try again.';
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.applySearch();
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredEmployees = this.employees.filter(employee => {
      const fullName = [
        employee.firstname,
        employee.middlename,
        employee.lastname
      ].filter(Boolean).join(' ').toLowerCase();

      return (
        fullName.includes(term) ||
        (employee.checknumber || '').toLowerCase().includes(term) ||
        (employee.forcenumber || '').toLowerCase().includes(term) ||
        (employee.email || '').toLowerCase().includes(term)
      );
    });
  }

  viewEmployee(id: number): void {
    this.router.navigate(['/employee-details', id]);
  }

  addEmployee(): void {
    this.router.navigate(['/add-employee']);
  }
}
