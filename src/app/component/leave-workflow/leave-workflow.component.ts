
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveApplicationService } from 'src/app/services/leave-application.service';
import {
  LeaveWorkflowTracking,
  LeaveWorkflowHistory
} from 'src/app/models/leave-workflow-history.model';

@Component({
  selector: 'app-leave-workflow',
  templateUrl: './leave-workflow.component.html',
  styleUrls: ['./leave-workflow.component.css']
})
export class LeaveWorkflowComponent implements OnInit {

  tracking: LeaveWorkflowTracking | null = null;

  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leaveApplicationService: LeaveApplicationService
  ) {}

  ngOnInit(): void {
    const applicationId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!applicationId || applicationId <= 0) {
      this.errorMessage = 'Invalid leave application number.';
      return;
    }

    this.loadWorkflow(applicationId);
  }

  loadWorkflow(applicationId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.leaveApplicationService
      .getMyWorkflowHistory(applicationId)
      .subscribe({
        next: (response) => {
          this.tracking = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load leave workflow:', error);

          this.errorMessage =
            error.status === 403
              ? 'Huna ruhusa ya kuona historia ya ombi hili.'
              : error.status === 404
                ? 'Ombi la likizo halijapatikana.'
                : 'Imeshindikana kupata historia ya ombi.';

          this.loading = false;
        }
      });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      OCS: 'Waiting for OCS',
      OCD: 'Waiting for OCD',
      RPC: 'Waiting for RPC',
      CP: 'Waiting for CP',
      IGP: 'Waiting for IGP',
      COMPLETED: 'Completed / Approved',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled'
    };

    return labels[status] || status;
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      SUBMITTED: 'Leave application submitted',
      FORWARDED_BY_OCS: 'Forwarded by OCS',
      FORWARDED_BY_OCD: 'Forwarded by OCD',
      APPROVED_BY_RPC: 'Approved by RPC',
      FORWARDED_BY_RPC: 'Forwarded by RPC',
      FORWARDED_BY_RPC_TO_IGP: 'Forwarded by RPC to IGP',
      FORWARDED_BY_RPC_TO_CP: 'Forwarded by RPC to CP',
      FORWARDED_BY_CP: 'Forwarded by CP to IGP',
      APPROVED_BY_IGP: 'Approved by IGP',
      REJECTED_BY_OCS: 'Rejected by OCS',
      REJECTED_BY_OCD: 'Rejected by OCD',
      REJECTED_BY_RPC: 'Rejected by RPC'
    };

    return labels[action] || action.replace(/_/g, ' ');
  }

  get history(): LeaveWorkflowHistory[] {
    return this.tracking?.history || [];
  }

  goBack(): void {
    this.router.navigate(['/employee/leave-history']);
  }

}
