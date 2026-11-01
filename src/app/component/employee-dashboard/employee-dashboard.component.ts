import { Component, OnInit } from '@angular/core';
import { LeaveSummaryService } from 'src/app/services/leave-summary.service';
import { LeaveSummary } from 'src/app/models/leave-summary.model';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {

  summary: LeaveSummary = {
    total: 0,
    ocs: 0,
    ocd: 0,
    rpc: 0,
    cp: 0,
    igp: 0,
    approved: 0,
    rejected: 0
  };

  get pending(): number {
  return this.summary.ocs +
         this.summary.ocd +
         this.summary.rpc +
         this.summary.cp +
         this.summary.igp;
}

  loading = true;
  errorMessage = '';

  constructor(
    private leaveSummaryService: LeaveSummaryService
  ) {}

  ngOnInit(): void {
    this.loadLeaveSummary();
  }

  loadLeaveSummary(): void {
    this.loading = true;
    this.errorMessage = '';

    this.leaveSummaryService.getMyLeaveSummary().subscribe({
      next: (response: LeaveSummary) => {
        this.summary = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load leave summary:', error);

        this.errorMessage =
          'Imeshindikana kupata takwimu za likizo. Tafadhali jaribu tena.';

        this.loading = false;
      }
    });
  }

}