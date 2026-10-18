
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AdministrativeApiService } from 'src/app/services/administrative-api.service';
import { District, Station } from 'src/app/models/administrative.models';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.css']
})
export class StationsComponent implements OnInit {

  stations: Station[] = [];
  districts: District[] = [];
  stationForm!: FormGroup;

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
    this.loadDistricts();
    this.loadStations();
  }

  initializeForm(): void {
    this.stationForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(30)]],
      description: [''],
      active: [true],
      districtId: ['', Validators.required]
    });
  }

  get filteredStations(): Station[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.stations;
    }

    return this.stations.filter(station =>
      station.name?.toLowerCase().includes(term) ||
      station.code?.toLowerCase().includes(term) ||
      station.districtName?.toLowerCase().includes(term) ||
      station.description?.toLowerCase().includes(term)
    );
  }

  loadDistricts(): void {
    this.api.getDistricts().subscribe({
      next: (data: District[]) => {
        this.districts = data;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kupata orodha ya Districts.'
        );
      }
    });
  }

  loadStations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getStations().subscribe({
      next: (data: Station[]) => {
        this.stations = data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kupata orodha ya Stations.'
        );
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.stationForm.reset({
      name: '',
      code: '',
      description: '',
      active: true,
      districtId: ''
    });

    this.modalOpen = true;
  }

  openEditModal(station: Station): void {
    if (!station.id) {
      return;
    }

    this.selectedId = station.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.stationForm.reset({
      name: station.name,
      code: station.code,
      description: station.description || '',
      active: station.active,
      districtId: station.districtId
    });

    this.modalOpen = true;
  }

  closeModal(): void {
    if (this.saving) {
      return;
    }

    this.modalOpen = false;
    this.stationForm.reset();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  saveStation(): void {
    if (this.stationForm.invalid || this.saving) {
      this.stationForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const value = this.stationForm.getRawValue();

    const payload: Station = {
      name: value.name.trim(),
      code: value.code.trim().toUpperCase(),
      description: value.description?.trim() || '',
      active: value.active,
      districtId: Number(value.districtId)
    };

    const isEditing = this.selectedId !== null;

    const request = isEditing
      ? this.api.updateStation(this.selectedId!, payload)
      : this.api.createStation(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.modalOpen = false;

        this.successMessage = isEditing
          ? 'Station imeboreshwa kikamilifu.'
          : 'Station imeongezwa kikamilifu.';

        this.loadStations();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kuhifadhi Station.'
        );
        this.saving = false;
      }
    });
  }

  deleteStation(station: Station): void {
    if (!station.id) {
      return;
    }

    const confirmed = window.confirm(
      `Una uhakika unataka kufuta Station "${station.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.api.deleteStation(station.id).subscribe({
      next: () => {
        this.successMessage = 'Station imefutwa kikamilifu.';
        this.loadStations();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Imeshindikana kufuta Station. Hakikisha hakuna data zinazotegemea Station hii.'
        );
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.stationForm.get(field);

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
