
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Employee, EmployeeRequest } from '../../models/employee.model';

import {
  Administrative,
  Region,
  District,
  Station
} from '../../models/administrative.models';

import { EmployeeService } from '../../services/employee.service';
import { AdministrativeApiService } from '../../services/administrative-api.service';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.css']
})
export class EditEmployeeComponent implements OnInit {

  employeeId!: number;

  loading = false;
  loadingEmployee = true;
  submitted = false;

  successMessage = '';
  errorMessage = '';

  administratives: Administrative[] = [];
  regions: Region[] = [];
  districts: District[] = [];
  stations: Station[] = [];

  ranks: Employee['rank'][] = [
    'PC', 'CPL', 'SGT', 'SSGT', 'SM',
    'A_INSP', 'INSP', 'ASP', 'SP', 'SSP',
    'ACP', 'SACP', 'DCP', 'CP', 'IGP'
  ];

  employeeForm = this.fb.group({
    checknumber: ['', Validators.required],
    forcenumber: ['', Validators.required],
    firstname: ['', Validators.required],
    middlename: [''],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', Validators.required],
    rank: ['', Validators.required],
    administrativeId: [null as number | null, Validators.required],
    regionId: [null as number | null],
    districtId: [null as number | null],
    stationId: [null as number | null]
  });

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private administrativeApi: AdministrativeApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid employee ID.';
      this.loadingEmployee = false;
      return;
    }

    this.employeeId = id;

    this.setupLocationListeners();
    this.loadEmployee();
  }

  

  // =========================================
  // LOAD EMPLOYEE
  // =========================================

  private loadEmployee(): void {
    this.loadingEmployee = true;
    this.errorMessage = '';

    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        this.patchEmployeeDetails(employee);
        this.loadAdministrativesAndLocations(employee);
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.errorMessage = 'Failed to load employee details.';
        this.loadingEmployee = false;
      }
    });
  }

  private patchEmployeeDetails(employee: Employee): void {
    this.employeeForm.patchValue({
      checknumber: employee.checknumber,
      forcenumber: employee.forcenumber,
      firstname: employee.firstname,
      middlename: employee.middlename ?? '',
      lastname: employee.lastname,
      email: employee.email,
      gender: employee.gender,
      rank: employee.rank
    });
  }

  // =========================================
  // LOAD ADMINISTRATIVES AND LOCATIONS
  // =========================================

  private loadAdministrativesAndLocations(
    employee: Employee
  ): void {

    this.administrativeApi.getAdministratives().subscribe({
      next: (items) => {
        this.administratives = items;

        const employeeData = employee as Employee & {
          administrativeId?: number | null;
          regionId?: number | null;
          districtId?: number | null;
          stationId?: number | null;
        };

        const administrative = this.administratives.find(item =>
          item.id === employeeData.administrativeId
        ) ?? this.findByName(
          this.administratives,
          employee.administrative
        );

        if (!administrative) {
          this.errorMessage =
            'Employee details loaded, but the administrative area could not be matched.';
          this.loadingEmployee = false;
          return;
        }

        // FIX 1: Hakikisha administrative.id ipo.
        if (administrative.id == null) {
          this.errorMessage =
            'Administrative area ID is missing.';
          this.loadingEmployee = false;
          return;
        }

        this.employeeForm.patchValue({
          administrativeId: administrative.id
        }, { emitEvent: false });

        this.loadRegionsForEmployee(
          employee,
          administrative.id,
          employeeData
        );
      },
      error: (error) => {
        console.error('Error loading administratives:', error);
        this.errorMessage = 'Failed to load administrative areas.';
        this.loadingEmployee = false;
      }
    });
  }

  // =========================================
  // LOAD REGIONS
  // =========================================

  private loadRegionsForEmployee(
    employee: Employee,
    administrativeId: number,
    employeeData: Employee & {
      administrativeId?: number | null;
      regionId?: number | null;
      districtId?: number | null;
      stationId?: number | null;
    }
  ): void {

    this.administrativeApi
      .getRegionsByAdministrative(administrativeId)
      .subscribe({
        next: (items) => {
          this.regions = items;

          const region = items.find(item =>
            item.id === employeeData.regionId
          ) ?? this.findByName(items, employee.region);

          if (!region) {
            this.loadingEmployee = false;
            return;
          }

          // FIX 2: Hakikisha region.id ipo.
          if (region.id == null) {
            this.errorMessage = 'Region ID is missing.';
            this.loadingEmployee = false;
            return;
          }

          this.employeeForm.patchValue({
            regionId: region.id
          }, { emitEvent: false });

          this.loadDistrictsForEmployee(
            employee,
            region.id,
            employeeData
          );
        },
        error: (error) => {
          console.error('Error loading regions:', error);
          this.errorMessage = 'Failed to load regions.';
          this.loadingEmployee = false;
        }
      });
  }

  // =========================================
  // LOAD DISTRICTS
  // =========================================

  private loadDistrictsForEmployee(
    employee: Employee,
    regionId: number,
    employeeData: Employee & {
      administrativeId?: number | null;
      regionId?: number | null;
      districtId?: number | null;
      stationId?: number | null;
    }
  ): void {

    this.administrativeApi
      .getDistrictsByRegion(regionId)
      .subscribe({
        next: (items) => {
          this.districts = items;

          const district = items.find(item =>
            item.id === employeeData.districtId
          ) ?? this.findByName(items, employee.district);

          if (!district) {
            this.loadingEmployee = false;
            return;
          }

          // FIX 3: Hakikisha district.id ipo.
          if (district.id == null) {
            this.errorMessage = 'District ID is missing.';
            this.loadingEmployee = false;
            return;
          }

          this.employeeForm.patchValue({
            districtId: district.id
          }, { emitEvent: false });

          this.loadStationsForEmployee(
            employee,
            district.id,
            employeeData
          );
        },
        error: (error) => {
          console.error('Error loading districts:', error);
          this.errorMessage = 'Failed to load districts.';
          this.loadingEmployee = false;
        }
      });
  }

  // =========================================
  // LOAD STATIONS
  // =========================================

  private loadStationsForEmployee(
    employee: Employee,
    districtId: number,
    employeeData: Employee & {
      administrativeId?: number | null;
      regionId?: number | null;
      districtId?: number | null;
      stationId?: number | null;
    }
  ): void {

    this.administrativeApi
      .getStationsByDistrict(districtId)
      .subscribe({
        next: (items) => {
          this.stations = items;

          const station = items.find(item =>
            item.id === employeeData.stationId
          ) ?? this.findByName(items, employee.station);

          if (station && station.id != null) {
            this.employeeForm.patchValue({
              stationId: station.id
            }, { emitEvent: false });
          }

          this.loadingEmployee = false;
        },
        error: (error) => {
          console.error('Error loading stations:', error);
          this.errorMessage = 'Failed to load stations.';
          this.loadingEmployee = false;
        }
      });
  }

  // =========================================
  // LOCATION DROPDOWN LISTENERS
  // =========================================

  private setupLocationListeners(): void {

    this.employeeForm
      .get('administrativeId')
      ?.valueChanges.subscribe(id => {

        this.regions = [];
        this.districts = [];
        this.stations = [];

        this.employeeForm.patchValue({
          regionId: null,
          districtId: null,
          stationId: null
        }, { emitEvent: false });

        if (id != null) {
          this.administrativeApi
            .getRegionsByAdministrative(Number(id))
            .subscribe({
              next: items => {
                this.regions = items;
              },
              error: error => {
                console.error('Error loading regions:', error);
              }
            });
        }
      });

    this.employeeForm
      .get('regionId')
      ?.valueChanges.subscribe(id => {

        this.districts = [];
        this.stations = [];

        this.employeeForm.patchValue({
          districtId: null,
          stationId: null
        }, { emitEvent: false });

        if (id != null) {
          this.administrativeApi
            .getDistrictsByRegion(Number(id))
            .subscribe({
              next: items => {
                this.districts = items;
              },
              error: error => {
                console.error('Error loading districts:', error);
              }
            });
        }
      });

    this.employeeForm
      .get('districtId')
      ?.valueChanges.subscribe(id => {

        this.stations = [];

        this.employeeForm.patchValue({
          stationId: null
        }, { emitEvent: false });

        if (id != null) {
          this.administrativeApi
            .getStationsByDistrict(Number(id))
            .subscribe({
              next: items => {
                this.stations = items;
              },
              error: error => {
                console.error('Error loading stations:', error);
              }
            });
        }
      });
  }

  // =========================================
  // MATCH LOCATION BY NAME
  // =========================================

  private findByName<T extends { name: string }>(
    items: T[],
    name: string | null | undefined
  ): T | undefined {

    if (!name) {
      return undefined;
    }

    return items.find(item =>
      item.name?.trim().toLowerCase() ===
      name.trim().toLowerCase()
    );
  }

  // =========================================
  // UPDATE EMPLOYEE
  // =========================================

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.errorMessage =
        'Please fill in all required fields.';
      return;
    }

    const form = this.employeeForm.getRawValue();

    if (form.administrativeId == null) {
      this.errorMessage =
        'Please select an administrative area.';
      return;
    }

    const request: EmployeeRequest = {
      checknumber: (form.checknumber ?? '').trim(),
      forcenumber: (form.forcenumber ?? '').trim(),
      firstname: (form.firstname ?? '').trim(),
      middlename: (form.middlename ?? '').trim() || null,
      lastname: (form.lastname ?? '').trim(),
      email: (form.email ?? '').trim(),
      gender: form.gender!,
      rank: form.rank as Employee['rank'],
      administrativeId: Number(form.administrativeId),
      regionId: form.regionId,
      districtId: form.districtId,
      stationId: form.stationId
    };

    this.loading = true;

    this.employeeService
      .updateEmployee(this.employeeId, request)
      .subscribe({
        next: () => {
  this.loading = false;

  // Rudi kwenye Employee List baada ya update kufanikiwa.
  this.router.navigate(['/employees'], {
    state: {
      successMessage: 'Employee updated successfully.'
    }
  });
},
        error: (error) => {
          console.error('Error updating employee:', error);

          this.errorMessage =
            error.error?.message ||
            'Failed to update employee.';

          this.loading = false;
        }
      });
  }

  // =========================================
  // CANCEL
  // =========================================

  cancel(): void {
    this.router.navigate(['/employees']);
  }
  goBack(): void {
  this.router.navigate(['/employees']);
}
}
