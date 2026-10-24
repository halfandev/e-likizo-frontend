import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainlayoutComponent } from './admindashboard/mainlayout/mainlayout.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { UsersComponent } from './component/users/users.component';
import { AddUserComponent } from './component/add-user/add-user.component';
import { ProfileComponent } from './component/profile/profile.component';
import { LoginComponent } from './authentication/login/login.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { AuthGuard } from './auth/auth.guard';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { HrdashboradComponent } from './component/hrdashborad/hrdashborad.component';
import { EmployeeDashboardComponent } from './component/employee-dashboard/employee-dashboard.component';
import { AdministrativesComponent } from './component/administratives/administratives.component';
import { RegionsComponent } from './component/regions/regions.component';
import { DistrictsComponent } from './component/districts/districts.component';
import { StationsComponent } from './component/stations/stations.component';
import { EmployeesComponent } from './component/employees/employees.component';
import { AddEmployeeComponent } from './component/add-employee/add-employee.component';
import { EmployeeDetailsComponent } from './component/employee-details/employee-details.component';
import { EditEmployeeComponent } from './component/edit-employee/edit-employee.component';
import { roleGuard } from './guards/role.guard';
import { ManageLeaveTypesComponent } from './pages/admin/manage-leave-types/manage-leave-types.component';
import { ManageLeaveApplicationsComponent } from './pages/admin/manage-leave-applications/manage-leave-applications.component';
import { ApplyLeaveComponent } from './pages/leave/apply-leave/apply-leave.component';
import { FamilyMembersComponent } from './pages/family-members/family-members.component';
import { LeaveHistoryComponent } from './pages/leave-history/leave-history.component';


const routes: Routes = [
  // Ukifungua application, nenda login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Authentication routes - nje ya MainlayoutComponent
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegistrationComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },

  // Main application layout
  {
    path: '',
    component: MainlayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'add-user',
        component: AddUserComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'hr-dashboard',
        component: HrdashboradComponent,
        canActivate: [AuthGuard],
        data: { roles: ['HR'] }
      },
      {
        path: 'employee-dashboard',
        component: EmployeeDashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: ['EMPLOYEE'] }
      },
      {
        path: 'admin/administratives',
        component: AdministrativesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/regions',
        component: RegionsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/districts',
        component: DistrictsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/stations',
        component: StationsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'employees',
        component: EmployeesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'HR'] }
      },
      {
        path: 'add-employee',
        component: AddEmployeeComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'HR'] }
      },
      {
        path: 'edit-employee/:id',
        component: EditEmployeeComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'HR'] }
      },
      {
        path: 'employee-details/:id',
        component: EmployeeDetailsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'HR'] }
      },

      {
        path: 'admin/leave-types',
        component: ManageLeaveTypesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }

      },

      {
        path: 'admin/leave-applications',
        component: ManageLeaveApplicationsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      },

      {
        path: 'employee/apply-leave',
        component: ApplyLeaveComponent,
        canActivate: [AuthGuard],
        data: { roles: ['EMPLOYEE'] }
      },

      {
        path: 'my-dependents',
        component: FamilyMembersComponent,
        canActivate: [AuthGuard],
        data: { roles: ['EMPLOYEE'] }
      },
      {
        path: 'leave-history',
        component: LeaveHistoryComponent,
        canActivate: [AuthGuard],
        data: { roles: ['EMPLOYEE'] }
      }
    ]
  },

  // URL isiyojulikana irudi login
  {
    path: '**',
    redirectTo: 'login'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
