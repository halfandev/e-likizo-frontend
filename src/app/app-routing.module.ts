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

const routes: Routes = [
  {
    path: "", component: MainlayoutComponent, children: [
      {
        path: "dashboard",
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }

      },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }


      },
      {
        path: "add-user",
        component: AddUserComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }


      },
      {
        path: "profile",
        component: ProfileComponent,
        canActivate: [AuthGuard]

      },

      {
        path: "hr-dashboard",
        component: HrdashboradComponent,
        canActivate: [AuthGuard],
        data: { roles: ['HR'] }

      },

      {
        path: "employee-dashboard",
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
        component: AddEmployeeComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'HR'] }
      },



      // {
      //   path: '',
      //   redirectTo: 'login',
      //   pathMatch: 'full'
      // },
      {
        path: '**',
        redirectTo: 'login'
      }
    ]
  },

  { path: "login", component: LoginComponent },
  { path: "register", component: RegistrationComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password", component: ResetPasswordComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
