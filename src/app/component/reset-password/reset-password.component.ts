
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  resetForm: FormGroup;

  token = '';
  submitted = false;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]]
    });
  }

  get f() {
    return this.resetForm.controls;
  }

 
onSubmit(): void {
  this.submitted = true;
  this.errorMessage = '';
  this.successMessage = '';

  if (!this.token) {
    this.errorMessage =
      'Reset token haipo kwenye link. Tafadhali omba link mpya.';
    return;
  }

  if (this.resetForm.invalid || this.loading) {
    this.resetForm.markAllAsTouched();
    return;
  }

  const newPassword = this.resetForm.value.newPassword;
  const confirmPassword = this.resetForm.value.confirmPassword;

  if (newPassword !== confirmPassword) {
    this.errorMessage = 'Passwords hazifanani.';
    return;
  }

  this.loading = true;

  this.authService.resetPassword({
    token: this.token,
    newPassword: newPassword!,
    confirmPassword: confirmPassword!
  })
  .pipe(
    finalize(() => this.loading = false)
  )
  .subscribe({
    next: (response) => {
      this.successMessage =
        response.message ||
        'Password imebadilishwa kwa mafanikio.';

      this.resetForm.reset();
      this.submitted = false;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    },

    error: (error: HttpErrorResponse) => {
      if (error.status === 0) {
        this.errorMessage =
          'Imeshindikana kuwasiliana na server. Jaribu tena.';
      } else {
        this.errorMessage =
          error.error?.message ||
          error.error?.detail ||
          (typeof error.error === 'string'
            ? error.error
            : null) ||
          'Imeshindikana kubadilisha password. Hakikisha link bado ni halali.';
      }
    }
  });
}


  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
