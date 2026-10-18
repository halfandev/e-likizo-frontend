
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AdministrativeApiService } from 'src/app/services/administrative-api.service';
import { Administrative, Region } from 'src/app/models/administrative.models';

@Component({
  selector: 'app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.css']
})
export class RegionsComponent implements OnInit {

  regions: Region[] = [];
  administratives: Administrative[] = [];

  regionForm!: FormGroup;

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
    this.initializeForm();
    this.loadAdministratives();
    this.loadRegions();
  }

  initializeForm(): void {
    this.regionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(30)]],
      description: [''],
      active: [true],
      administrativeId: ['', Validators.required]
    });
  }

  get filteredRegions(): Region[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.regions;
    }

    return this.regions.filter(region =>
      region.name?.toLowerCase().includes(term) ||
      region.code?.toLowerCase().includes(term) ||
      region.administrativeName?.toLowerCase().includes(term) ||
      region.description?.toLowerCase().includes(term)
    );
  }

  loadAdministratives(): void {
    this.api.getAdministratives().subscribe({
      next: (data: Administrative[]) => {
        this.administratives = data;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kupata Administrative.'
        );
      }
    });
  }

  loadRegions(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getRegions().subscribe({
      next: (data: Region[]) => {
        this.regions = data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kupata orodha ya Regions.'
        );
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.regionForm.reset({
      name: '',
      code: '',
      description: '',
      active: true,
      administrativeId: ''
    });

    this.modalOpen = true;
  }

  openEditModal(region: Region): void {
    if (!region.id) {
      return;
    }

    this.selectedId = region.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.regionForm.reset({
      name: region.name,
      code: region.code,
      description: region.description || '',
      active: region.active,
      administrativeId: region.administrativeId
    });

    this.modalOpen = true;
  }

  closeModal(): void {
    if (this.saving) {
      return;
    }

    this.modalOpen = false;
    this.regionForm.reset();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  saveRegion(): void {
    if (this.regionForm.invalid || this.saving) {
      this.regionForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const formValue = this.regionForm.getRawValue();

    const payload: Region = {
      name: formValue.name.trim(),
      code: formValue.code.trim().toUpperCase(),
      description: formValue.description?.trim() || '',
      active: formValue.active,
      administrativeId: Number(formValue.administrativeId)
    };

    const request = this.selectedId !== null
      ? this.api.updateRegion(this.selectedId, payload)
      : this.api.createRegion(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.modalOpen = false;

        this.successMessage = this.selectedId !== null
          ? 'Region imeboreshwa kikamilifu.'
          : 'Region imeongezwa kikamilifu.';

        this.loadRegions();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kuhifadhi Region.'
        );
        this.saving = false;
      }
    });
  }

  deleteRegion(region: Region): void {
    if (!region.id) {
      return;
    }

    const confirmed = window.confirm(
      `Una uhakika unataka kufuta Region "${region.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.api.deleteRegion(region.id).subscribe({
      next: () => {
        this.successMessage = 'Region imefutwa kikamilifu.';
        this.loadRegions();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kufuta Region. Hakikisha haina data zinazotegemea Region hii.'
        );
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.regionForm.get(field);

    return !!control &&
      control.invalid &&
      (control.touched || control.dirty);
  }

  getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    if (error.status === 0) {
      return 'Imeshindikana kuwasiliana na server. Hakikisha Spring Boot inaendelea kufanya kazi.';
    }

    if (error.status === 401) {
      return 'Session yako imeisha au hujaingia kwenye mfumo. Tafadhali login tena.';
    }

    if (error.status === 403) {
      return 'Huna ruhusa ya kufanya kitendo hiki.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    return fallback;
  }
}
