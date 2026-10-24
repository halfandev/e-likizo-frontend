import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FamilyMember } from 'src/app/models/family-member.model';
import { LeaveApplication, LeaveApplicationRequest } from 'src/app/models/leave-application.model';
import { LeaveSummary } from 'src/app/models/leave-summary.model';
import { LeaveType } from 'src/app/models/leave-type.model';
import { AuthService } from 'src/app/services/auth.service';
import { FamilyMemberService } from 'src/app/services/family-member.service';
import { LeaveApplicationService } from 'src/app/services/leave-application.service';
import { LeaveSummaryService } from 'src/app/services/leave-summary.service';
import { LeaveTypeService } from 'src/app/services/leave-type.service';

@Component({
  selector: 'app-leave-history',
  templateUrl: './leave-history.component.html',
  styleUrls: ['./leave-history.component.css']
})
export class LeaveHistoryComponent  implements OnInit{

  today: string = this.getTodayDate();
  
    leaveForm!: FormGroup;
  
    leaveTypes: LeaveType[] = [];
    myApplications: LeaveApplication[] = [];
    familyMembers: FamilyMember[] = [];
  
    summary: LeaveSummary = {
      approved: 0,
      rejected: 0,
      pending: 0
    };
  
    loading = false;
    loadingTypes = false;
    loadingApplications = false;
    loadingFamilyMembers = false;
    submitting = false;
  
    successMessage = '';
    errorMessage = '';
    summaryErrorMessage = '';
  
    employeeId: number | null = null;
    modalOpen = false;
  
    constructor(
      private fb: FormBuilder,
      private leaveTypeService: LeaveTypeService,
      private leaveApplicationService: LeaveApplicationService,
      private authService: AuthService,
      private familyMemberService: FamilyMemberService,
      private leaveSummaryService: LeaveSummaryService
    ) {}
  
    ngOnInit(): void {
      this.leaveForm = this.fb.group({
        leaveTypeId: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        reason: ['', [
          Validators.required,
          Validators.maxLength(1000)
        ]],
        familyMemberId: [null]
      });
  
      const currentUser = this.authService.getUser();
      this.employeeId = currentUser?.employeeId ?? null;
  
      this.loadLeaveSummary();
      this.loadLeaveTypes();
      this.loadFamilyMembers();
      this.loadMyApplications();
    }
  
    private getTodayDate(): string {
      const date = new Date();
  
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
  
      return `${year}-${month}-${day}`;
    }
  
    // Pata takwimu za maombi ya likizo.
    loadLeaveSummary(): void {
      this.loading = true;
      this.summaryErrorMessage = '';
  
      this.leaveSummaryService.getMyLeaveSummary().subscribe({
        next: (response: LeaveSummary) => {
          this.summary = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load leave summary:', error);
  
          this.summaryErrorMessage =
            'Imeshindikana kupata takwimu za likizo. Tafadhali jaribu tena.';
  
          this.loading = false;
        }
      });
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
  
    // Pakia aina za likizo.
    loadLeaveTypes(): void {
      this.loadingTypes = true;
  
      this.leaveTypeService.getActive().subscribe({
        next: (types: LeaveType[]) => {
          this.leaveTypes = types || [];
          this.loadingTypes = false;
        },
        error: (error) => {
          console.error('Failed to load leave types:', error);
  
          this.errorMessage =
            'Imeshindwa kupata aina za likizo. Tafadhali jaribu tena.';
  
          this.loadingTypes = false;
        }
      });
    }
  
    // Pakia wategemezi.
    loadFamilyMembers(): void {
      this.loadingFamilyMembers = true;
  
      this.familyMemberService.getMyFamilyMembers().subscribe({
        next: (members: FamilyMember[]) => {
          this.familyMembers = members || [];
          this.loadingFamilyMembers = false;
        },
        error: (error) => {
          console.error('Failed to load family members:', error);
  
          this.familyMembers = [];
          this.loadingFamilyMembers = false;
        }
      });
    }
  
    // Pakia historia ya maombi.
    loadMyApplications(): void {
      this.loadingApplications = true;
  
      this.leaveApplicationService.getEmployeeApplications().subscribe({
        next: (applications: LeaveApplication[]) => {
          this.myApplications = applications || [];
          this.loadingApplications = false;
        },
        error: (error) => {
          console.error('Failed to load applications:', error);
  
          this.errorMessage =
            error.error?.message ||
            'Imeshindwa kupata maombi yako ya likizo.';
  
          this.loadingApplications = false;
        }
      });
    }
  
    // Hesabu siku pamoja na tarehe ya kuanza na kumaliza.
    getRequestedDays(): number {
      const startDate: string =
        this.leaveForm?.get('startDate')?.value;
  
      const endDate: string =
        this.leaveForm?.get('endDate')?.value;
  
      if (!startDate || !endDate || endDate < startDate) {
        return 0;
      }
  
      const start = new Date(`${startDate}T00:00:00Z`).getTime();
      const end = new Date(`${endDate}T00:00:00Z`).getTime();
  
      return Math.floor((end - start) / 86400000) + 1;
    }
  
    // Pata aina ya likizo iliyochaguliwa.
    getSelectedLeaveType(): LeaveType | undefined {
      if (!this.leaveForm) {
        return undefined;
      }
  
      const selectedId = Number(
        this.leaveForm.get('leaveTypeId')?.value
      );
  
      return this.leaveTypes.find(
        type => Number(type.id) === selectedId
      );
    }
  
    // Angalia kama ni Annual Leave.
    get requiresFamilyMember(): boolean {
      const selectedType = this.getSelectedLeaveType();
  
      const leaveCode = selectedType?.code
        ?.trim()
        .toUpperCase();
  
      return leaveCode === 'ANNUAL';
    }
  
    // Mtegemezi anahitajika kwa Annual Leave ya siku 28.
    get requiresDependentForSubmission(): boolean {
      return this.requiresFamilyMember &&
        this.getRequestedDays() === 28;
    }
  
    // Tuma ombi la likizo.
    submitApplication(): void {
      this.successMessage = '';
      this.errorMessage = '';
  
      if (this.leaveForm.invalid) {
        this.leaveForm.markAllAsTouched();
        return;
      }
  
      const startDate: string = this.leaveForm.value.startDate;
      const endDate: string = this.leaveForm.value.endDate;
      const reason: string =
        this.leaveForm.value.reason?.trim() || '';
  
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
  
        this.errorMessage =
          'Tafadhali jaza sababu ya kuomba likizo.';
  
        return;
      }
  
      const familyMemberId =
        this.leaveForm.get('familyMemberId')?.value;
  
      if (this.requiresDependentForSubmission) {
        if (!familyMemberId) {
          this.leaveForm.get('familyMemberId')?.markAsTouched();
  
          this.errorMessage =
            'Kwa Annual Leave ya siku 28, lazima uchague mtegemezi.';
  
          return;
        }
  
        const memberExists = this.familyMembers.some(
          member => Number(member.id) === Number(familyMemberId)
        );
  
        if (!memberExists) {
          this.errorMessage =
            'Mtegemezi aliyechaguliwa hakupatikana. Tafadhali pakia upya orodha.';
  
          return;
        }
      }
  
      const request: LeaveApplicationRequest = {
        leaveTypeId: Number(this.leaveForm.value.leaveTypeId),
        startDate,
        endDate,
        reason,
        ...(this.requiresDependentForSubmission
          ? { familyMemberId: Number(familyMemberId) }
          : {})
      };
  
      this.submitting = true;
  
      this.leaveApplicationService.applyForLeave(request).subscribe({
        next: (application) => {
          this.successMessage =
            `Ombi la likizo limetumwa kikamilifu. Namba ya ombi ni #${application.id}.`;
  
          this.modalOpen = false;
  
          this.leaveForm.reset({
            leaveTypeId: '',
            startDate: '',
            endDate: '',
            reason: '',
            familyMemberId: null
          });
  
          this.submitting = false;
  
          // Sasisha historia na cards baada ya kutuma ombi.
          this.loadMyApplications();
          this.loadLeaveSummary();
        },
        error: (error) => {
          console.error('Failed to submit leave application:', error);
  
          if (error.status === 401) {
            this.errorMessage =
              'Session yako imeisha. Tafadhali ingia tena kwenye mfumo.';
          } else if (error.status === 403) {
            this.errorMessage =
              error.error?.message ||
              'Huna ruhusa ya kufanya ombi hili. Hakikisha JWT token inatumwa na Angular.';
          } else {
            this.errorMessage =
              error.error?.message ||
              'Imeshindwa kutuma ombi la likizo. Tafadhali jaribu tena.';
          }
  
          this.submitting = false;
        }
      });
    }
  
    // Tafsiri status.
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
