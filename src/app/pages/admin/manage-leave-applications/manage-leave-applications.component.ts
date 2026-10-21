
import { Component, OnInit } from '@angular/core';
import { LeaveApplicationService } from 'src/app/services/leave-application.service';
import {
  LeaveApplication,
  LeaveStatus
} from 'src/app/models/leave-application.model';

@Component({
  selector: 'app-manage-leave-applications',
  templateUrl: './manage-leave-applications.component.html',
  styleUrls: ['./manage-leave-applications.component.css']
})
export class ManageLeaveApplicationsComponent implements OnInit {

  applications: LeaveApplication[] = [];

  loading = false;
  processingId: number | null = null;
  selectedStatus = 'ALL';

  successMessage = '';
  errorMessage = '';

  constructor(
    private leaveApplicationService: LeaveApplicationService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.errorMessage = '';

    this.leaveApplicationService.getAllApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load leave applications:', error);

        this.errorMessage =
          error.status === 403
            ? 'Huna ruhusa ya kuona maombi haya.'
            : 'Imeshindwa kupata maombi. Tafadhali jaribu tena.';

        this.loading = false;
      }
    });
  }

  get filteredApplications(): LeaveApplication[] {
    if (this.selectedStatus === 'ALL') {
      return this.applications;
    }

    return this.applications.filter(
      application => application.status === this.selectedStatus
    );
  }

  get pendingCount(): number {
    return this.applications.filter(
      item => item.status === 'PENDING'
    ).length;
  }

  get underReviewCount(): number {
    return this.applications.filter(
      item => item.status === 'UNDER_REVIEW'
    ).length;
  }

  get approvedCount(): number {
    return this.applications.filter(
      item => item.status === 'APPROVED'
    ).length;
  }

  get rejectedCount(): number {
    return this.applications.filter(
      item => item.status === 'REJECTED'
    ).length;
  }

  markUnderReview(application: LeaveApplication): void {
    this.processApplication(
      application,
      'review'
    );
  }

  approveApplication(application: LeaveApplication): void {
    if (!window.confirm(
      `Una uhakika unataka kuidhinisha ombi #${application.id}?`
    )) {
      return;
    }

    this.processApplication(application, 'approve');
  }

  rejectApplication(application: LeaveApplication): void {
    if (!window.confirm(
      `Una uhakika unataka kukataa ombi #${application.id}?`
    )) {
      return;
    }

    this.processApplication(application, 'reject');
  }

  private processApplication(
    application: LeaveApplication,
    action: 'review' | 'approve' | 'reject'
  ): void {

    this.processingId = application.id;
    this.successMessage = '';
    this.errorMessage = '';

    let request$;

    switch (action) {
      case 'review':
        request$ =
          this.leaveApplicationService.markUnderReview(application.id);
        break;

      case 'approve':
        request$ =
          this.leaveApplicationService.approveApplication(application.id);
        break;

      case 'reject':
        request$ =
          this.leaveApplicationService.rejectApplication(application.id);
        break;
    }

    request$.subscribe({
      next: (updatedApplication) => {
        const index = this.applications.findIndex(
          item => item.id === updatedApplication.id
        );

        if (index !== -1) {
          this.applications[index] = updatedApplication;
          this.applications = [...this.applications];
        }

        const messages: Record<'review' | 'approve' | 'reject', string> = {
          review: 'Ombi limewekwa kwenye hatua ya review.',
          approve: 'Ombi limeidhinishwa kikamilifu.',
          reject: 'Ombi limekataliwa.'
        };

        this.successMessage = messages[action];
        this.processingId = null;
      },
      error: (error) => {
        console.error('Failed to process application:', error);

        this.errorMessage =
          error.status === 403
            ? 'Huna ruhusa ya kufanya kitendo hiki.'
            : error.status === 409
              ? 'Ombi hili tayari limefanyiwa maamuzi.'
              : 'Imeshindwa kubadilisha hali ya ombi.';

        this.processingId = null;
      }
    });
  }

  sstatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';

    case 'UNDER_REVIEW':
      return 'Under Review';

    case 'APPROVED':
      return 'Approved';

    case 'REJECTED':
      return 'Rejected';

    case 'CANCELLED':
      return 'Cancelled';

    default:
      return status;
  }
}

  trackByApplicationId(
    index: number,
    application: LeaveApplication
  ): number {
    return application.id;
  }
}
