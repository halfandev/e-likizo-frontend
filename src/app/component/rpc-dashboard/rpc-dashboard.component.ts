import { Component, OnInit } from '@angular/core';

import { LeaveApplication, LeaveStatus } from 'src/app/models/leave-application.model';
import { RpcLeaveService } from 'src/app/services/rpcleave.service';

@Component({
  selector: 'app-rpc-dashboard',
  templateUrl: './rpc-dashboard.component.html',
  styleUrls: ['./rpc-dashboard.component.css']
})
export class RpcDashboardComponent implements OnInit {

  // Maombi yanayosubiri RPC
  applications: LeaveApplication[] = [];

  // Maombi yaliyokamilika
  approvedApplications: LeaveApplication[] = [];

  // Maombi yaliyokataliwa
  rejectedApplications: LeaveApplication[] = [];

  // Ombi lililochaguliwa
  selectedApplication: LeaveApplication | null = null;

  comment = '';

  loading = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private rpcLeaveService: RpcLeaveService
  ) {}

  ngOnInit(): void {
    this.refreshDashboard();
  }

  // Refresh dashboard nzima
  refreshDashboard(): void {
    this.loadApplications();
    this.loadApprovedApplications();
    this.loadRejectedApplications();
  }

  // 1. Pata maombi yanayosubiri RPC
  loadApplications(): void {

    this.loading = true;
    this.errorMessage = '';

    this.rpcLeaveService.getRPCApplications().subscribe({

      next: (data) => {
        this.applications = data || [];
        this.loading = false;
      },

      error: (error) => {
        console.error('RPC inbox error:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kupata maombi yanayosubiri RPC.';

        this.loading = false;
      }

    });
  }

  // 2. Pata maombi yaliyokamilika
  loadApprovedApplications(): void {

    this.rpcLeaveService.getApprovedApplications().subscribe({

      next: (data) => {
        this.approvedApplications = data || [];
      },

      error: (error) => {
        console.error('Approved applications error:', error);
      }

    });
  }

  // 3. Pata maombi yaliyokataliwa
  loadRejectedApplications(): void {

    this.rpcLeaveService.getRejectedApplications().subscribe({

      next: (data) => {
        this.rejectedApplications = data || [];
      },

      error: (error) => {
        console.error('Rejected applications error:', error);
      }

    });
  }

  // Fungua taarifa za ombi
  viewApplication(application: LeaveApplication): void {

    this.selectedApplication = application;

    this.comment = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Funga modal
  closeDetails(): void {

    if (this.submitting) {
      return;
    }

    this.selectedApplication = null;
    this.comment = '';
  }

  // RPC ana-approve au forward ombi
  approveApplication(application: LeaveApplication): void {

    if (!this.comment.trim()) {
      this.errorMessage =
        'Tafadhali andika maoni kabla ya kuidhinisha ombi.';

      return;
    }

    const confirmed = confirm(
      'Una uhakika unataka kuidhinisha au kupeleka ombi hili hatua inayofuata?'
    );

    if (!confirmed) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.rpcLeaveService.approveApplication(
      application.id,
      this.comment.trim()
    ).subscribe({

      next: (response) => {

        this.submitting = false;

        if (response.status === LeaveStatus.COMPLETED) {

          this.successMessage =
            'Ombi limeidhinishwa na kukamilika.';

        } else {

          this.successMessage =
            'Ombi limepelekwa katika hatua inayofuata.';

        }

        this.selectedApplication = null;
        this.comment = '';

        this.refreshDashboard();
      },

      error: (error) => {

        console.error('RPC approval error:', error);

        this.submitting = false;

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kushughulikia ombi hili.';

      }

    });
  }

  // RPC anakataa ombi
  rejectApplication(application: LeaveApplication): void {

    if (!this.comment.trim()) {
      this.errorMessage =
        'Tafadhali andika sababu ya kukataa ombi.';

      return;
    }

    const confirmed = confirm(
      'Una uhakika unataka kukataa ombi hili?'
    );

    if (!confirmed) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.rpcLeaveService.rejectApplication(
      application.id,
      this.comment.trim()
    ).subscribe({

      next: () => {

        this.submitting = false;

        this.successMessage =
          'Ombi limekataliwa kikamilifu.';

        this.selectedApplication = null;
        this.comment = '';

        this.refreshDashboard();
      },

      error: (error) => {

        console.error('RPC rejection error:', error);

        this.submitting = false;

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kukataa ombi hili.';

      }

    });
  }

  // Jumla ya maombi yanayosubiri RPC
  get totalApplications(): number {
    return this.applications.length;
  }

  // Jumla ya siku zilizoombwa
  get totalRequestedDays(): number {

    return this.applications.reduce(
      (total, application) =>
        total + application.requestedDays,
      0
    );
  }

  get totalApproved(): number {
    return this.approvedApplications.length;
  }

  get totalRejected(): number {
    return this.rejectedApplications.length;
  }

}