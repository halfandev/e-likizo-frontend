
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AdministrativeApiService } from 'src/app/services/administrative-api.service';
import { District, Region } from 'src/app/models/administrative.models';

@Component({
  selector: 'app-districts',
  templateUrl: './districts.component.html',
  styleUrls: ['./districts.component.css']
})
export class DistrictsComponent implements OnInit {

  districts: District[] = [];
  regions: Region[] = [];
  districtForm!: FormGroup;

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
    this.loadRegions();
    this.loadDistricts();
  }

  initializeForm(): void {
    this.districtForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(30)]],
      description: [''],
      active: [true],
      regionId: ['', Validators.required]
    });
  }

  get filteredDistricts(): District[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.districts;
    }

    return this.districts.filter(district =>
      district.name?.toLowerCase().includes(term) ||
      district.code?.toLowerCase().includes(term) ||
      district.regionName?.toLowerCase().includes(term) ||
      district.description?.toLowerCase().includes(term)
    );
  }

  loadRegions(): void {
    this.api.getRegions().subscribe({
      next: (data: Region[]) => {
        this.regions = data;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kupata orodha ya Regions.'
        );
      }
    });
  }

  loadDistricts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getDistricts().subscribe({
      next: (data: District[]) => {
        this.districts = data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kupata orodha ya Districts.'
        );
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.districtForm.reset({
      name: '',
      code: '',
      description: '',
      active: true,
      regionId: ''
    });

    this.modalOpen = true;
  }

  openEditModal(district: District): void {
    if (!district.id) {
      return;
    }

    this.selectedId = district.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.districtForm.reset({
      name: district.name,
      code: district.code,
      description: district.description || '',
      active: district.active,
      regionId: district.regionId
    });

    this.modalOpen = true;
  }

  closeModal(): void {
    if (this.saving) {
      return;
    }

    this.modalOpen = false;
    this.districtForm.reset();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  saveDistrict(): void {
    if (this.districtForm.invalid || this.saving) {
      this.districtForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const value = this.districtForm.getRawValue();

    const payload: District = {
      name: value.name.trim(),
      code: value.code.trim().toUpperCase(),
      description: value.description?.trim() || '',
      active: value.active,
      regionId: Number(value.regionId)
    };

    const isEditing = this.selectedId !== null;

    const request = isEditing
      ? this.api.updateDistrict(this.selectedId!, payload)
      : this.api.createDistrict(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.modalOpen = false;

        this.successMessage = isEditing
          ? 'District imeboreshwa kikamilifu.'
          : 'District imeongezwa kikamilifu.';

        this.loadDistricts();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kuhifadhi District.'
        );
        this.saving = false;
      }
    });
  }

  deleteDistrict(district: District): void {
    if (!district.id) {
      return;
    }

    const confirmed = window.confirm(
      `Una uhakika unataka kufuta District "${district.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.api.deleteDistrict(district.id).subscribe({
      next: () => {
        this.successMessage = 'District imefutwa kikamilifu.';
        this.loadDistricts();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kufuta District. Hakikisha hakuna data zinazotegemea District hii.'
        );
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.districtForm.get(field);

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
