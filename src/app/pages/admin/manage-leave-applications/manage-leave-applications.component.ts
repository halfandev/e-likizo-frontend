
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

  // Ruhusu kutumia enum kwenye HTML
  LeaveStatus = LeaveStatus;

  loading = false;
  processingId: number | null = null;
  selectedStatus: LeaveStatus | 'ALL' = 'ALL';

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

  // Maombi yaliyopo kwa OCS
  get ocsCount(): number {
    return this.applications.filter(
      item => item.status === LeaveStatus.OCS
    ).length;
  }

  // Maombi yaliyopo kwa OCD
  get ocdCount(): number {
    return this.applications.filter(
      item => item.status === LeaveStatus.OCD
    ).length;
  }

  // Maombi yaliyopo kwa RPC
  get rpcCount(): number {
    return this.applications.filter(
      item => item.status === LeaveStatus.RPC
    ).length;
  }

  // Maombi yaliyopo kwa CP
  get cpCount(): number {
    return this.applications.filter(
      item => item.status === LeaveStatus.CP
    ).length;
  }

  // Maombi yaliyopo kwa IGP
  get igpCount(): number {
    return this.applications.filter(
      item => item.status === LeaveStatus.IGP
    ).length;
  }

  // Maombi yaliyoidhinishwa kikamilifu
  get completedCount(): number {
    return this.applications.filter(
      item => item.status === LeaveStatus.COMPLETED
    ).length;
  }

  get rejectedCount(): number {
    return this.applications.filter(
      item => item.status === LeaveStatus.REJECTED
    ).length;
  }

  get cancelledCount(): number {
    return this.applications.filter(
      item => item.status === LeaveStatus.CANCELLED
    ).length;
  }

  sstatusLabel(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.OCS:
        return 'Waiting for OCS';

      case LeaveStatus.OCD:
        return 'Waiting for OCD';

      case LeaveStatus.RPC:
        return 'Waiting for RPC';

      case LeaveStatus.CP:
        return 'Waiting for CP';

      case LeaveStatus.IGP:
        return 'Waiting for IGP';

      case LeaveStatus.COMPLETED:
        return 'Completed / Approved';

      case LeaveStatus.REJECTED:
        return 'Rejected';

      case LeaveStatus.CANCELLED:
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
