
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  AdminService,
  AdminCreateUserRequest
} from 'src/app/services/admin.service';

import {
  AdministrativeApiService
} from 'src/app/services/administrative-api.service';

import {
  Administrative,
  Region,
  District,
  Station
} from 'src/app/models/administrative.models';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  currentStep = 1;
  loading = false;
  loadingLocations = false;

  successMessage = '';
  errorMessage = '';
  locationError = '';

  roles = [
    'HR',
    'EMPLOYEE',
    'ACCOUNTANT',
    'MANAGER',
    'OCS',
    'OCD',
    'RPC',
    'CP',
    'IGP'
  ];

  administratives: Administrative[] = [];
  regions: Region[] = [];
  districts: District[] = [];
  stations: Station[] = [];

  registrationForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],

    administrativeId: [null as number | null],
    regionId: [null as number | null],
    districtId: [null as number | null],
    stationId: [null as number | null]
  });

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private administrativeService: AdministrativeApiService
  ) {}

  ngOnInit(): void {
    this.loadAdministratives();

    this.registrationForm.controls.role.valueChanges.subscribe(role => {
      this.resetLocationFields();
      this.updateLocationValidators(role || '');
      this.currentStep = 1;
    });
  }

  // =====================================
  // ROLE CHECKS
  // =====================================

  get selectedRole(): string {
    return this.registrationForm.controls.role.value || '';
  }

  get isAuthorityRole(): boolean {
    return ['OCS', 'OCD', 'RPC', 'CP', 'IGP']
      .includes(this.selectedRole);
  }

  get showRegion(): boolean {
    return ['OCS', 'OCD', 'RPC'].includes(this.selectedRole);
  }

  get showDistrict(): boolean {
    return ['OCS', 'OCD'].includes(this.selectedRole);
  }

  get showStation(): boolean {
    return this.selectedRole === 'OCS';
  }

  get totalSteps(): number {
    return this.isAuthorityRole ? 3 : 2;
  }

  get stepProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  // =====================================
  // LOAD ADMINISTRATIVES
  // =====================================

  loadAdministratives(): void {
    this.loadingLocations = true;
    this.locationError = '';

    this.administrativeService.getAdministratives()
      .pipe(finalize(() => this.loadingLocations = false))
      .subscribe({
        next: response => {
          this.administratives = response.filter(item => item.active);
        },
        error: error => {
          console.error(error);
          this.locationError = 'Failed to load administrative organizations.';
        }
      });
  }

  // =====================================
  // ADMINISTRATIVE SELECTED
  // =====================================

  onAdministrativeChange(): void {
    const administrativeId =
      this.registrationForm.controls.administrativeId.value;

    this.regions = [];
    this.districts = [];
    this.stations = [];

    this.registrationForm.patchValue({
      regionId: null,
      districtId: null,
      stationId: null
    });

    if (!administrativeId) {
      return;
    }

    this.loadingLocations = true;
    this.locationError = '';

    this.administrativeService
      .getRegionsByAdministrative(administrativeId)
      .pipe(finalize(() => this.loadingLocations = false))
      .subscribe({
        next: response => {
          this.regions = response.filter(item => item.active);
        },
        error: error => {
          console.error(error);
          this.locationError = 'Failed to load regions.';
        }
      });
  }

  // =====================================
  // REGION SELECTED
  // =====================================

  onRegionChange(): void {
    const regionId = this.registrationForm.controls.regionId.value;

    this.districts = [];
    this.stations = [];

    this.registrationForm.patchValue({
      districtId: null,
      stationId: null
    });

    if (!regionId) {
      return;
    }

    this.loadingLocations = true;
    this.locationError = '';

    this.administrativeService
      .getDistrictsByRegion(regionId)
      .pipe(finalize(() => this.loadingLocations = false))
      .subscribe({
        next: response => {
          this.districts = response.filter(item => item.active);
        },
        error: error => {
          console.error(error);
          this.locationError = 'Failed to load districts.';
        }
      });
  }

  // =====================================
  // DISTRICT SELECTED
  // =====================================

  onDistrictChange(): void {
    const districtId = this.registrationForm.controls.districtId.value;

    this.stations = [];

    this.registrationForm.patchValue({
      stationId: null
    });

    if (!districtId) {
      return;
    }

    this.loadingLocations = true;
    this.locationError = '';

    this.administrativeService
      .getStationsByDistrict(districtId)
      .pipe(finalize(() => this.loadingLocations = false))
      .subscribe({
        next: response => {
          this.stations = response.filter(item => item.active);
        },
        error: error => {
          console.error(error);
          this.locationError = 'Failed to load stations.';
        }
      });
  }

  // =====================================
  // RESET LOCATION FIELDS
  // =====================================

  resetLocationFields(): void {
    this.registrationForm.patchValue({
      administrativeId: null,
      regionId: null,
      districtId: null,
      stationId: null
    });

    this.regions = [];
    this.districts = [];
    this.stations = [];

    this.locationError = '';
  }

  // =====================================
  // VALIDATORS
  // =====================================

  updateLocationValidators(role: string): void {
    const controls = this.registrationForm.controls;

    controls.administrativeId.clearValidators();
    controls.regionId.clearValidators();
    controls.districtId.clearValidators();
    controls.stationId.clearValidators();

    if (['OCS', 'OCD', 'RPC', 'CP', 'IGP'].includes(role)) {
      controls.administrativeId.setValidators(Validators.required);
    }

    if (['OCS', 'OCD', 'RPC'].includes(role)) {
      controls.regionId.setValidators(Validators.required);
    }

    if (['OCS', 'OCD'].includes(role)) {
      controls.districtId.setValidators(Validators.required);
    }

    if (role === 'OCS') {
      controls.stationId.setValidators(Validators.required);
    }

    controls.administrativeId.updateValueAndValidity();
    controls.regionId.updateValueAndValidity();
    controls.districtId.updateValueAndValidity();
    controls.stationId.updateValueAndValidity();
  }

  // =====================================
  // STEP 1 VALIDATION
  // =====================================

  validateStepOne(): boolean {
    const controls = this.registrationForm.controls;

    controls.fullName.markAsTouched();
    controls.email.markAsTouched();
    controls.role.markAsTouched();

    return controls.fullName.valid &&
           controls.email.valid &&
           controls.role.valid;
  }

  // =====================================
  // LOCATION VALIDATION
  // =====================================

  validateLocation(): boolean {
    const controls = this.registrationForm.controls;

    controls.administrativeId.markAsTouched();

    if (controls.administrativeId.invalid) {
      return false;
    }

    if (this.showRegion) {
      controls.regionId.markAsTouched();

      if (controls.regionId.invalid) {
        return false;
      }
    }

    if (this.showDistrict) {
      controls.districtId.markAsTouched();

      if (controls.districtId.invalid) {
        return false;
      }
    }

    if (this.showStation) {
      controls.stationId.markAsTouched();

      if (controls.stationId.invalid) {
        return false;
      }
    }

    return true;
  }

  // =====================================
  // NEXT STEP
  // =====================================

  nextStep(): void {
    this.errorMessage = '';

    if (this.currentStep === 1) {
      if (!this.validateStepOne()) {
        return;
      }

      if (!this.isAuthorityRole) {
        this.currentStep = 2;
      } else {
        this.currentStep = 2;
      }

      return;
    }

    if (this.currentStep === 2 && this.isAuthorityRole) {
      if (!this.validateLocation()) {
        return;
      }

      this.currentStep = 3;
    }
  }

  // =====================================
  // PREVIOUS STEP
  // =====================================

  previousStep(): void {
    this.errorMessage = '';

    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // =====================================
  // GET SELECTED LOCATION NAMES
  // =====================================

  get administrativeName(): string {
    const id = this.registrationForm.controls.administrativeId.value;

    return this.administratives.find(item => item.id === id)?.name || '-';
  }

  get regionName(): string {
    const id = this.registrationForm.controls.regionId.value;

    return this.regions.find(item => item.id === id)?.name || '-';
  }

  get districtName(): string {
    const id = this.registrationForm.controls.districtId.value;

    return this.districts.find(item => item.id === id)?.name || '-';
  }

  get stationName(): string {
    const id = this.registrationForm.controls.stationId.value;

    return this.stations.find(item => item.id === id)?.name || '-';
  }

  // =====================================
  // REGISTER USER
  // =====================================

  registerUser(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    if (this.isAuthorityRole && !this.validateLocation()) {
      this.currentStep = 2;
      return;
    }

    const form = this.registrationForm.getRawValue();

    const request: AdminCreateUserRequest = {
      fullName: form.fullName!.trim(),
      email: form.email!.trim(),
      role: form.role!
    };

    if (this.isAuthorityRole) {
      request.administrativeId = form.administrativeId!;

      if (this.showRegion) {
        request.regionId = form.regionId!;
      }

      if (this.showDistrict) {
        request.districtId = form.districtId!;
      }

      if (this.showStation) {
        request.stationId = form.stationId!;
      }
    }

    this.loading = true;

    this.adminService.createUser(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: response => {
          this.successMessage =
            `User ${response.fullName || request.fullName} registered successfully.`;

          this.registrationForm.reset();
          this.resetLocationFields();
          this.currentStep = 1;
        },
        error: error => {
          console.error(error);

          this.errorMessage =
            typeof error.error === 'string'
              ? error.error
              : error.error?.message ||
                'Failed to register user. Please try again.';

          this.currentStep = 1;
        }
      });
  }
}
