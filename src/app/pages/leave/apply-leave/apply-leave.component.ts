
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LeaveTypeService } from 'src/app/services/leave-type.service';
import { LeaveApplicationService } from 'src/app/services/leave-application.service';
import { AuthService } from 'src/app/services/auth.service';

import { LeaveType } from 'src/app/models/leave-type.model';
import {
  LeaveApplication,
  LeaveApplicationRequest
} from 'src/app/models/leave-application.model';

@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.css']
})
export class ApplyLeaveComponent implements OnInit {

  today: string = new Date().toISOString().split('T')[0];

  leaveForm!: FormGroup;

  leaveTypes: LeaveType[] = [];
  myApplications: LeaveApplication[] = [];

  loadingTypes = false;
  loadingApplications = false;
  submitting = false;

  successMessage = '';
  errorMessage = '';

  employeeId: number | null = null;

  // Hali ya kufungua na kufunga modal.
  modalOpen = false;

  constructor(
    private fb: FormBuilder,
    private leaveTypeService: LeaveTypeService,
    private leaveApplicationService: LeaveApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      leaveTypeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [
        Validators.required,
        Validators.maxLength(1000)
      ]]
    });

    // Pata Employee ID kutoka kwa mtumiaji aliyeingia.
    const currentUser = this.authService.getUser();
    this.employeeId = currentUser?.employeeId ?? null;

    // Pakia aina za likizo.
    this.loadLeaveTypes();

    // Pakia historia ya maombi.
    if (this.employeeId !== null) {
      this.loadMyApplications();
    } else {
      this.errorMessage =
        'Employee ID haijapatikana. Tafadhali ingia tena kwenye mfumo.';
    }
  }

  // Fungua modal.
  openModal(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.modalOpen = true;
  }

  // Funga modal.
  closeModal(): void {
    if (this.submitting) {
      return;
    }

    this.modalOpen = false;
    this.errorMessage = '';
  }

  loadLeaveTypes(): void {
    this.loadingTypes = true;

    this.leaveTypeService.getActive().subscribe({
      next: (types) => {
        this.leaveTypes = types;
        this.loadingTypes = false;
      },
      error: (error) => {
        console.error('Failed to load leave types:', error);
        this.errorMessage = 'Imeshindwa kupata aina za likizo.';
        this.loadingTypes = false;
      }
    });
  }

  loadMyApplications(): void {
    if (this.employeeId === null) {
      this.errorMessage =
        'Employee ID haijapatikana. Tafadhali ingia tena kwenye mfumo.';
      return;
    }

    this.loadingApplications = true;

    this.leaveApplicationService
      .getEmployeeApplications(this.employeeId)
      .subscribe({
        next: (applications) => {
          this.myApplications = applications;
          this.loadingApplications = false;
        },
        error: (error) => {
          console.error('Failed to load applications:', error);
          this.errorMessage =
            'Imeshindwa kupata maombi yako ya likizo.';
          this.loadingApplications = false;
        }
      });
  }

  submitApplication(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    if (this.employeeId === null) {
      this.errorMessage =
        'Employee ID haijapatikana. Tafadhali ingia tena kwenye mfumo.';
      return;
    }

    const startDate = this.leaveForm.value.startDate;
    const endDate = this.leaveForm.value.endDate;
    const reason = this.leaveForm.value.reason?.trim();

    if (startDate < this.today) {
      this.errorMessage =
        'Tarehe ya kuanza likizo haiwezi kuwa kabla ya leo.';
      return;
    }

    if (endDate < startDate) {
      this.errorMessage =
        'Tarehe ya kumaliza likizo haiwezi kuwa kabla ya tarehe ya kuanza.';
      return;
    }

    if (!reason) {
      this.leaveForm.get('reason')?.setValue('');
      this.leaveForm.get('reason')?.markAsTouched();
      return;
    }

    const request: LeaveApplicationRequest = {
      leaveTypeId: Number(this.leaveForm.value.leaveTypeId),
      startDate,
      endDate,
      reason
    };

    this.submitting = true;

    this.leaveApplicationService
      .applyForLeave(this.employeeId, request)
      .subscribe({
        next: (application) => {
          this.successMessage =
            `Ombi la likizo limetumwa kikamilifu. Namba ya ombi ni #${application.id}.`;

          // Funga modal baada ya mafanikio.
          this.modalOpen = false;

          // Safisha form kwa ombi linalofuata.
          this.leaveForm.reset({
            leaveTypeId: '',
            startDate: '',
            endDate: '',
            reason: ''
          });

          this.submitting = false;

          // Sasisha historia.
          this.loadMyApplications();
        },
        error: (error) => {
          console.error('Failed to submit leave application:', error);

          this.errorMessage =
            error.error?.message ||
            'Imeshindwa kutuma ombi la likizo. Tafadhali jaribu tena.';

          // Modal inabaki wazi ili mtumiaji aone kosa.
          this.submitting = false;
        }
      });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled'
    };

    return labels[status] || status;
  }
}
