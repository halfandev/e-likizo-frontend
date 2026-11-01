
import { Component, OnInit } from '@angular/core';
import { LeaveApplication } from 'src/app/models/leave-application.model';
import { OcsLeaveService } from 'src/app/services/ocsleave.service';

@Component({
  selector: 'app-ocs-dashboard',
  templateUrl: './ocs-dashboard.component.html',
  styleUrls: ['./ocs-dashboard.component.css']
})
export class OcsDashboardComponent implements OnInit {

  applications: LeaveApplication[] = [];

  forwardedApplications: LeaveApplication[] = [];

  selectedApplication: LeaveApplication | null = null;

  totalHigherLevelApplications = 0;

  comment = '';

  loading = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';

  constructor(private ocsLeaveService: OcsLeaveService) {}

  ngOnInit(): void {
    // Pakia maombi yote mawili wakati Dashboard inafunguliwa
    this.refreshDashboard();
  }

  // Refresh dashboard nzima
  refreshDashboard(): void {
    this.loadApplications();
    this.loadForwardedApplications();
      this.loadHigherLevelApplicationsCount();

  }

  loadHigherLevelApplicationsCount(): void {

  this.ocsLeaveService.getHigherLevelApplicationsCount().subscribe({

    next: (total) => {
      this.totalHigherLevelApplications = total || 0;
    },

    error: (error) => {
      console.error('Error loading higher level applications:', error);
      this.totalHigherLevelApplications = 0;
    }

  });

}

  // Maombi yanayosubiri OCS
  loadApplications(): void {

    this.loading = true;
    this.errorMessage = '';

    this.ocsLeaveService.getOCSApplications().subscribe({

      next: (data) => {
        this.applications = data || [];
        this.loading = false;
      },

      error: (error) => {
        console.error('Error loading OCS applications:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kupata maombi ya likizo. Tafadhali jaribu tena.';

        this.loading = false;
      }

    });
  }

  // Maombi ambayo OCS ameshapeleka OCD
  loadForwardedApplications(): void {

    this.ocsLeaveService.getOCSForwardedApplications().subscribe({

      next: (data) => {
        this.forwardedApplications = data || [];
      },

      error: (error) => {
        console.error('Error loading forwarded applications:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kupata maombi yaliyokwisha pelekwa OCD.';
      }

    });
  }

  // Kufungua maelezo ya ombi
  viewApplication(application: LeaveApplication): void {

    this.selectedApplication = application;
    this.comment = '';

    this.successMessage = '';
    this.errorMessage = '';
  }

  // Kufunga modal
  closeDetails(): void {

    this.selectedApplication = null;
    this.comment = '';
  }

  get totalOCSForwarded(): number {
  return this.forwardedApplications.length;
}

  // Kupeleka ombi kwa OCD
  forwardApplication(application: LeaveApplication): void {

    if (!this.comment.trim()) {
      this.errorMessage =
        'Tafadhali andika maoni kabla ya kupeleka ombi.';
      return;
    }

    const confirmed = confirm(
      'Una uhakika unataka kupeleka ombi hili kwa OCD?'
    );

    if (!confirmed) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.ocsLeaveService.forwardToOCD(
      application.id,
      this.comment.trim()
    ).subscribe({

      next: () => {

        this.successMessage =
          'Ombi limepelekwa kwa OCD kikamilifu.';

        this.submitting = false;

        this.closeDetails();

        // Refresh maombi yote mawili
        this.refreshDashboard();
      },

      error: (error) => {

        console.error('Forward error:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kupeleka ombi kwa OCD.';

        this.submitting = false;
      }

    });
  }

  // Kukataa ombi
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

    this.ocsLeaveService.rejectApplication(
      application.id,
      this.comment.trim()
    ).subscribe({

      next: () => {

        this.successMessage =
          'Ombi limekataliwa kikamilifu.';

        this.submitting = false;

        this.closeDetails();

        // Refresh maombi yanayosubiri na yaliyokwisha pelekwa
        this.refreshDashboard();
      },

      error: (error) => {

        console.error('Reject error:', error);

        this.errorMessage =
          error.error?.message ||
          'Imeshindikana kukataa ombi.';

        this.submitting = false;
      }

    });
  }

  // Jumla ya maombi yanayosubiri
  get totalApplications(): number {
    return this.applications.length;
  }

  // Jumla ya siku za maombi yanayosubiri
  get totalRequestedDays(): number {

    return this.applications.reduce(
      (total, application) =>
        total + application.requestedDays,
      0
    );
  }

}
