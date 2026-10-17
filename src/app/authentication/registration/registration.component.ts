import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService, RegisterRequest } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {

  loading = false;
  successMessage = '';
  errorMessage = '';

  registrationForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  register(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const request: RegisterRequest = {
      fullName: this.registrationForm.value.fullName!.trim(),
      email: this.registrationForm.value.email!.trim()
    };

    this.loading = true;

    this.authService.register(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.successMessage = response;
          this.registrationForm.reset();
        },
        error: (error) => {
          this.errorMessage =
            typeof error.error === 'string'
              ? error.error
              : error.error?.message ||
                'Registration failed. Please try again.';
        }
      });
  }

}
