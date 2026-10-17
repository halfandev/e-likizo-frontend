import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';


function passwordsMatch(
  control: AbstractControl
): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword
    ? null
    : { passwordsMismatch: true };
}


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  user = this.authService.getUser();

  loading = false;
  successMessage = '';
  errorMessage = '';

  passwordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [Validators.required, Validators.minLength(8)]
      ],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  changePassword(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const request = {
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!,
      confirmPassword: this.passwordForm.value.confirmPassword!
    };

    this.loading = true;

    this.authService.changePassword(request).subscribe({
      next: (response: string) => {
        this.successMessage =
          response || 'Password changed successfully.';

        this.passwordForm.reset();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          typeof error.error === 'string'
            ? error.error
            : error.error?.message ||
              'Imeshindikana kubadilisha password. Hakikisha password ya sasa ni sahihi.';

        this.loading = false;
      }
    });
  }

}
