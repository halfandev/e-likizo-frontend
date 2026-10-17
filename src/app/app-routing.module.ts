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

      {path:"hr-dashboard",
        component:HrdashboradComponent,
        canActivate: [AuthGuard],
        data: { roles: ['HR'] }


 

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
  {path:"reset-password",component:ResetPasswordComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
