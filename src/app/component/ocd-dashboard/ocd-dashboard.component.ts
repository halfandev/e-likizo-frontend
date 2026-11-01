import { Component, OnInit } from '@angular/core';

import { LeaveApplication } from 'src/app/models/leave-application.model';

import {
  OcdLeaveService,
  OcdDashboardCounts
} from 'src/app/services/ocdleave.service';

@Component({
  selector: 'app-ocd-dashboard',
  templateUrl: './ocd-dashboard.component.html',
  styleUrls: ['./ocd-dashboard.component.css']
})
export class OcdDashboardComponent implements OnInit {

  applications: LeaveApplication[] = [];

  selectedApplication: LeaveApplication | null = null;

  dashboardCounts: OcdDashboardCounts = {
    waitingForOCD: 0,
    waitingForRPC: 0,
    waitingForCP: 0,
    waitingForIGP: 0
  };

  comment = '';

  loading = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';
  countsError = '';

  constructor(
    private ocdLeaveService: OcdLeaveService
  ) {}

  ngOnInit(): void {
    this.refreshDashboard();
  }

  // Refresh dashboard nzima
  refreshDashboard(): void {
    this.loadApplications();
    this.loadDashboardCounts();
  }

  // Pata maombi yaliyotumwa kwa OCD
  loadApplications(): void {

    this.loading = true;
    this.errorMessage = '';

    this.ocdLeaveService.getOCDApplications().subscribe({

      next: (data) => {
        this.applications = data || [];
        this.loading = false;
      },

      error: (error) => {
        console.error('Error loading OCD applications:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kupata maombi ya likizo. Tafadhali jaribu tena.';

        this.loading = false;
      }

    });
  }

  // Pata dashboard counts
  loadDashboardCounts(): void {

    this.countsError = '';

    this.ocdLeaveService.getOCDDashboardCounts().subscribe({

      next: (data) => {
        this.dashboardCounts = data || {
          waitingForOCD: 0,
          waitingForRPC: 0,
          waitingForCP: 0,
          waitingForIGP: 0
        };
      },

      error: (error) => {
        console.error('Error loading OCD dashboard counts:', error);

        this.countsError =
          error.error?.message ||
          'Imeshindikana kupata takwimu za dashboard.';
      }

    });
  }

  // Fungua modal ya maelezo ya ombi
  viewApplication(application: LeaveApplication): void {

    this.selectedApplication = application;
    this.comment = '';

    this.errorMessage = '';
    this.successMessage = '';
  }

  // Funga modal
  closeDetails(): void {

    if (this.submitting) {
      return;
    }

    this.selectedApplication = null;
    this.comment = '';
  }

  // OCD anapeleka ombi kwa RPC
  forwardApplication(application: LeaveApplication): void {

    if (!this.comment.trim()) {
      this.errorMessage =
        'Tafadhali andika maoni kabla ya kupeleka ombi kwa RPC.';
      return;
    }

    const confirmed = confirm(
      'Una uhakika unataka kupeleka ombi hili kwa RPC?'
    );

    if (!confirmed) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.ocdLeaveService.forwardToRPC(
      application.id,
      this.comment.trim()
    ).subscribe({

      next: () => {

        this.successMessage =
          'Ombi limepelekwa kwa RPC kikamilifu.';

        this.submitting = false;

        this.selectedApplication = null;
        this.comment = '';

        this.refreshDashboard();
      },

      error: (error) => {

        console.error('OCD forward error:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kupeleka ombi kwa RPC.';

        this.submitting = false;
      }

    });
  }

  // OCD anakataa ombi
  rejectApplication(application: LeaveApplication): void {

    if (!this.comment.trim()) {
      this.errorMessage =
        'Tafadhali eleza sababu ya kukataa ombi.';
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

    this.ocdLeaveService.rejectApplication(
      application.id,
      this.comment.trim()
    ).subscribe({

      next: () => {

        this.successMessage =
          'Ombi limekataliwa kikamilifu.';

        this.submitting = false;

        this.selectedApplication = null;
        this.comment = '';

        this.refreshDashboard();
      },

      error: (error) => {

        console.error('OCD reject error:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kukataa ombi.';

        this.submitting = false;
      }

    });
  }

  // Jumla ya maombi yanayosubiri OCD
  get totalApplications(): number {
    return this.applications.length;
  }

  // Jumla ya siku za maombi yanayosubiri OCD
  get totalRequestedDays(): number {

    return this.applications.reduce(
      (total, application) =>
        total + application.requestedDays,
      0
    );
  }
}