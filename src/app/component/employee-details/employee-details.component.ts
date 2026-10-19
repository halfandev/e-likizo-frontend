
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from 'src/app/models/employee.model';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent implements OnInit {

  employee: Employee | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid employee ID.';
      return;
    }

    this.loadEmployee(id);
  }

  loadEmployee(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService.getEmployeeById(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load employee profile:', error);
        this.errorMessage =
          error.status === 404
            ? 'Employee profile was not found.'
            : error.status === 403
              ? 'You are not authorized to view this profile.'
              : 'Failed to load employee profile. Please try again.';

        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  editEmployee(): void {
    if (this.employee) {
      this.router.navigate(['/edit-employee', this.employee.id]);
    }
  }
}
