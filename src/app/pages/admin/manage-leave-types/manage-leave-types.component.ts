
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { LeaveType, LeaveTypeRequest } from
  'src/app/models/leave-type.model';

import { LeaveTypeService } from
  'src/app/services/leave-type.service';

@Component({
  selector: 'app-manage-leave-types',
  templateUrl: './manage-leave-types.component.html',
  styleUrls: ['./manage-leave-types.component.css']
})
export class ManageLeaveTypesComponent implements OnInit {

  // Leave types displayed in the table
  leaveTypes: LeaveType[] = [];

  // Loading and saving states
  loading = false;
  saving = false;

  // Modal visibility
  showForm = false;

  // ID of the leave type being edited.
  // null means a new leave type is being created.
  editingId: number | null = null;

  // ID of the leave type whose status is changing
  changingStatusId: number | null = null;

  // Messages
  successMessage = '';
  errorMessage = '';
  modalErrorMessage = '';

  // Add/Edit form
  leaveTypeForm = this.fb.group({
    code: [
      '',
      [
        Validators.required,
        Validators.maxLength(50)
      ]
    ],

    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    description: [''],

    defaultDays: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^[1-9]\d*$/)
      ]
    ],

    requiresDocument: [false]
  });

  constructor(
    private fb: FormBuilder,
    private leaveTypeService: LeaveTypeService
  ) { }

  ngOnInit(): void {
    this.loadLeaveTypes();
  }

  // =====================================
  // LOAD LEAVE TYPES
  // =====================================

  loadLeaveTypes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.leaveTypeService.getAll().subscribe({
      next: (data: LeaveType[]) => {
        this.leaveTypes = data;
        this.loading = false;
      },

      error: (error: any) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Failed to load leave types.'
        );
      }
    });
  }

  // =====================================
  // OPEN ADD MODAL
  // =====================================

  openAddForm(): void {
    if (this.saving) {
      return;
    }

    this.editingId = null;
    this.modalErrorMessage = '';
    this.errorMessage = '';

    this.leaveTypeForm.reset({
      code: '',
      name: '',
      description: '',
      defaultDays: 1,
      requiresDocument: false
    });

    this.showForm = true;
  }

  // =====================================
  // OPEN EDIT MODAL
  // =====================================

  editLeaveType(item: LeaveType): void {
    if (this.saving) {
      return;
    }

    this.editingId = item.id;
    this.modalErrorMessage = '';
    this.errorMessage = '';

    this.leaveTypeForm.reset({
      code: item.code,
      name: item.name,
      description: item.description || '',
      defaultDays: item.defaultDays,
      requiresDocument: item.requiresDocument
    });

    this.showForm = true;
  }

  // =====================================
  // CLOSE MODAL
  // =====================================

  cancelForm(): void {
    if (this.saving) {
      return;
    }

    this.showForm = false;
    this.editingId = null;
    this.modalErrorMessage = '';

    this.leaveTypeForm.reset({
      code: '',
      name: '',
      description: '',
      defaultDays: 1,
      requiresDocument: false
    });
  }

  // =====================================
  // SAVE OR UPDATE LEAVE TYPE
  // =====================================

  saveLeaveType(): void {
    this.modalErrorMessage = '';

    if (this.leaveTypeForm.invalid) {
      this.leaveTypeForm.markAllAsTouched();
      return;
    }

    if (this.saving) {
      return;
    }

    const formValue = this.leaveTypeForm.getRawValue();

    const request: LeaveTypeRequest = {
      code: (formValue.code || '').trim().toUpperCase(),
      name: (formValue.name || '').trim(),
      description: (formValue.description || '').trim() || null,
      defaultDays: Number(formValue.defaultDays),
      requiresDocument: formValue.requiresDocument ?? false
    };

    // Prevent blank values and invalid day counts
    if (
      !request.code ||
      !request.name ||
      !Number.isInteger(request.defaultDays) ||
      request.defaultDays < 1
    ) {
      this.leaveTypeForm.markAllAsTouched();
      this.modalErrorMessage =
        'Please enter valid leave type details.';
      return;
    }

    this.saving = true;

    // UPDATE EXISTING LEAVE TYPE
    if (this.editingId !== null) {
      const id = this.editingId;

      this.leaveTypeService.update(id, request).subscribe({
        next: () => {
          this.saving = false;
          this.showForm = false;
          this.editingId = null;

          this.successMessage =
            'Leave type updated successfully.';

          this.modalErrorMessage = '';

          this.loadLeaveTypes();
        },

        error: (error: any) => {
          this.saving = false;

          this.modalErrorMessage = this.getErrorMessage(
            error,
            'Failed to update leave type.'
          );
        }
      });

      return;
    }

    // CREATE NEW LEAVE TYPE
    this.leaveTypeService.create(request).subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.editingId = null;

        this.successMessage =
          'Leave type created successfully.';

        this.modalErrorMessage = '';

        this.loadLeaveTypes();
      },

      error: (error: any) => {
        this.saving = false;

        this.modalErrorMessage = this.getErrorMessage(
          error,
          'Failed to create leave type.'
        );
      }
    });
  }

  // =====================================
  // ACTIVATE / DEACTIVATE
  // =====================================

  toggleActive(item: LeaveType): void {
    if (this.changingStatusId !== null) {
      return;
    }

    const action = item.active
      ? 'deactivate'
      : 'activate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.changingStatusId = item.id;
    this.errorMessage = '';
    this.successMessage = '';

    const request$ = item.active
      ? this.leaveTypeService.deactivate(item.id)
      : this.leaveTypeService.activate(item.id);

    request$.subscribe({
      next: () => {
        this.changingStatusId = null;

        this.successMessage = item.active
          ? 'Leave type deactivated successfully.'
          : 'Leave type activated successfully.';

        this.loadLeaveTypes();
      },

      error: (error: any) => {
        this.changingStatusId = null;

        this.errorMessage = this.getErrorMessage(
          error,
          `Failed to ${action} leave type.`
        );
      }
    });
  }

  // =====================================
  // ERROR MESSAGE HELPER
  // =====================================

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (error?.status === 0) {
      return 'Cannot connect to the server. Check that the Spring Boot backend is running.';
    }

    if (error?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }

    if (error?.status === 403) {
      return 'Access denied. Please log in using an administrator account.';
    }

    if (error?.status === 404) {
      return error?.error?.message ||
        'The requested leave type or API endpoint was not found.';
    }

    if (error?.status === 409) {
      return error?.error?.message ||
        'This leave type code already exists.';
    }

    if (error?.status === 400) {
      return error?.error?.message ||
        'Invalid information. Please check the fields and try again.';
    }

    return error?.error?.message ||
      error?.error?.error ||
      fallback;
  }

}
