import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminService, AdminCreateUserRequest } from 'src/app/services/admin.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {

  loading = false;
  successMessage = '';
  errorMessage = '';

  // Hakikisha majina haya yanafanana na Role enum ya Java.
  roles = ['ADMIN', 'HR', 'EMPLOYEE'];

  registrationForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {}

  registerUser(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const request: AdminCreateUserRequest = {
      fullName: this.registrationForm.controls.fullName.value!.trim(),
      email: this.registrationForm.controls.email.value!.trim(),
      role: this.registrationForm.controls.role.value!
    };

    this.loading = true;

    this.adminService.createUser(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.successMessage =
            `User ${response.fullName || request.fullName} registered successfully.`;

          this.registrationForm.reset();
        },
        error: (error) => {
          this.errorMessage =
            typeof error.error === 'string'
              ? error.error
              : error.error?.message ||
                'Failed to register user. Please try again.';
        }
      });
  }

}
