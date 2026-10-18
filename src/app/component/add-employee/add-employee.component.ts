
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EmployeeService } from '../../services/employee.service';
import { AdministrativeApiService } from '../../services/administrative-api.service';

import {
  Administrative,
  Region,
  District,
  Station
} from '../../models/administrative.models';

import { EmployeeRequest } from '../../models/employee.model';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {

  employeeForm!: FormGroup;

  administratives: Administrative[] = [];
  regions: Region[] = [];
  districts: District[] = [];
  stations: Station[] = [];

  ranks: string[] = [
    'PC', 'CPL', 'SGT', 'SSGT', 'SM',
    'A_INSP', 'INSP', 'ASP', 'SP', 'SSP',
    'ACP', 'SACP', 'DCP', 'CP', 'IGP'
  ];

  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private administrativeService: AdministrativeApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAdministratives();
    this.handleLocationChanges();
  }

  private initializeForm(): void {
    this.employeeForm = this.fb.group({
      checknumber: ['', Validators.required],
      forcenumber: ['', Validators.required],
      firstname: ['', Validators.required],
      middlename: [''],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      rank: ['', Validators.required],

      administrativeId: [null, Validators.required],
      regionId: [null],
      districtId: [null],
      stationId: [null]
    });
  }

  private loadAdministratives(): void {
    this.administrativeService.getAdministratives().subscribe({
      next: (data) => {
        this.administratives = data.filter(item => item.active);
      },
      error: (error) => {
        console.error('Failed to load administratives:', error);
        this.errorMessage =
          'Imeshindikana kupata orodha ya Administrative.';
      }
    });
  }

  private handleLocationChanges(): void {

    this.employeeForm.get('administrativeId')!
      .valueChanges.subscribe((administrativeId: number | null) => {

        this.regions = [];
        this.districts = [];
        this.stations = [];

        this.employeeForm.patchValue({
          regionId: null,
          districtId: null,
          stationId: null
        }, { emitEvent: false });

        if (administrativeId) {
          this.administrativeService
            .getRegionsByAdministrative(Number(administrativeId))
            .subscribe({
              next: (data) => {
                this.regions = data.filter(item => item.active);
              },
              error: (error) => {
                console.error('Failed to load regions:', error);
                this.errorMessage = 'Imeshindikana kupata Regions.';
              }
            });
        }
      });

    this.employeeForm.get('regionId')!
      .valueChanges.subscribe((regionId: number | null) => {

        this.districts = [];
        this.stations = [];

        this.employeeForm.patchValue({
          districtId: null,
          stationId: null
        }, { emitEvent: false });

        if (regionId) {
          this.administrativeService
            .getDistrictsByRegion(Number(regionId))
            .subscribe({
              next: (data) => {
                this.districts = data.filter(item => item.active);
              },
              error: (error) => {
                console.error('Failed to load districts:', error);
                this.errorMessage = 'Imeshindikana kupata Districts.';
              }
            });
        }
      });

    this.employeeForm.get('districtId')!
      .valueChanges.subscribe((districtId: number | null) => {

        this.stations = [];

        this.employeeForm.patchValue({
          stationId: null
        }, { emitEvent: false });

        if (districtId) {
          this.administrativeService
            .getStationsByDistrict(Number(districtId))
            .subscribe({
              next: (data) => {
                this.stations = data.filter(item => item.active);
              },
              error: (error) => {
                console.error('Failed to load stations:', error);
                this.errorMessage = 'Imeshindikana kupata Stations.';
              }
            });
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formValue = this.employeeForm.getRawValue();

    const request: EmployeeRequest = {
      checknumber: String(formValue.checknumber).trim(),
      forcenumber: String(formValue.forcenumber).trim(),
      firstname: String(formValue.firstname).trim(),
      middlename: formValue.middlename?.trim() || null,
      lastname: String(formValue.lastname).trim(),
      email: String(formValue.email).trim().toLowerCase(),
      gender: formValue.gender,
      rank: formValue.rank,
      administrativeId: Number(formValue.administrativeId),
      regionId: formValue.regionId
        ? Number(formValue.regionId) : null,
      districtId: formValue.districtId
        ? Number(formValue.districtId) : null,
      stationId: formValue.stationId
        ? Number(formValue.stationId) : null
    };

    this.loading = true;

    this.employeeService.registerEmployee(request).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage =
          'Mfanyakazi amesajiliwa kwa mafanikio.';

        this.employeeForm.reset();
        this.submitted = false;

        this.regions = [];
        this.districts = [];
        this.stations = [];

        // Nenda kwenye orodha baada ya muda mfupi
        setTimeout(() => {
          this.router.navigate(['/employees']);
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Employee registration failed:', error);

        this.errorMessage =
          error.error?.message ||
          error.error?.error ||
          'Imeshindikana kusajili mfanyakazi. Hakikisha taarifa ni sahihi na umeingia kwa akaunti yenye ruhusa.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
