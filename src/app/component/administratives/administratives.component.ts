
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AdministrativeApiService } from
  'src/app/services/administrative-api.service';

import { Administrative } from
  'src/app/models/administrative.models';

@Component({
  selector: 'app-administratives',
  templateUrl: './administratives.component.html',
  styleUrls: ['./administratives.component.css']
})
export class AdministrativesComponent implements OnInit {

  administrativeForm!: FormGroup;
  administratives: Administrative[] = [];

  selectedId: number | null = null;

  modalOpen = false;
  loading = false;
  saving = false;

  searchTerm = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: AdministrativeApiService
  ) {}

  ngOnInit(): void {
    this.administrativeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(30)]],
      description: ['', Validators.maxLength(255)],
      active: [true]
    });

    this.loadAdministratives();
  }

  get filteredAdministratives(): Administrative[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.administratives;
    }

    return this.administratives.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      (item.description || '').toLowerCase().includes(term)
    );
  }

  loadAdministratives(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getAdministratives().subscribe({
      next: data => {
        this.administratives = data;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kupata Administrative.'
        );
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.selectedId = null;
    this.errorMessage = '';

    this.administrativeForm.reset({
      name: '',
      code: '',
      description: '',
      active: true
    });

    this.modalOpen = true;
  }

  openEditModal(item: Administrative): void {
    if (!item.id) {
      return;
    }

    this.selectedId = item.id;
    this.errorMessage = '';

    this.administrativeForm.reset({
      name: item.name,
      code: item.code,
      description: item.description || '',
      active: item.active
    });

    this.modalOpen = true;
  }

  closeModal(): void {
    if (this.saving) {
      return;
    }

    this.modalOpen = false;
    this.selectedId = null;
    this.errorMessage = '';
    this.administrativeForm.reset({
      name: '',
      code: '',
      description: '',
      active: true
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  saveAdministrative(): void {
    if (this.administrativeForm.invalid) {
      this.administrativeForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const value = this.administrativeForm.getRawValue();

    const data: Administrative = {
      name: value.name.trim(),
      code: value.code.trim().toUpperCase(),
      description: value.description?.trim() || null,
      active: value.active
    };

    const isUpdate = this.selectedId !== null;

    const request = isUpdate
      ? this.api.updateAdministrative(this.selectedId!, data)
      : this.api.createAdministrative(data);

    request.subscribe({
      next: () => {
        this.successMessage = isUpdate
          ? 'Administrative imebadilishwa kikamilifu.'
          : 'Administrative imeongezwa kikamilifu.';

        this.modalOpen = false;
        this.selectedId = null;
        this.saving = false;

        this.loadAdministratives();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kuhifadhi Administrative.'
        );

        this.saving = false;
      }
    });
  }

  deleteAdministrative(item: Administrative): void {
    if (!item.id) {
      return;
    }

    const confirmed = window.confirm(
      `Una uhakika unataka kufuta "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.api.deleteAdministrative(item.id).subscribe({
      next: () => {
        this.successMessage = 'Administrative imefutwa.';
        this.loadAdministratives();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kufuta Administrative.'
        );
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.administrativeForm.get(field);

    return !!control &&
      control.invalid &&
      (control.touched || control.dirty);
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error?.detail) {
      return error.error.detail;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 401) {
      return 'Session imeisha au token si halali. Ingia tena.';
    }

    if (error.status === 403) {
      return 'Huna ruhusa. Hakikisha umeingia kama Admin.';
    }

    if (error.status === 0) {
      return 'Backend haipatikani au kuna tatizo la CORS.';
    }

    return fallback;
  }
}
