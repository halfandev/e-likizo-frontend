import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminSidebarComponent } from './admindashboard/admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './admindashboard/admin-footer/admin-footer.component';
import { MainlayoutComponent } from './admindashboard/mainlayout/mainlayout.component';
import { NavbarComponent } from './admindashboard/navbar/navbar.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { UsersComponent } from './component/users/users.component';
import { AddUserComponent } from './component/add-user/add-user.component';
import { ProfileComponent } from './component/profile/profile.component';
import { LoginComponent } from './authentication/login/login.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
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


@NgModule({
  declarations: [
    AppComponent,
    AdminSidebarComponent,
    
    AdminFooterComponent,
    MainlayoutComponent,
    NavbarComponent,
    DashboardComponent,
    UsersComponent,
    AddUserComponent,
    ProfileComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    HrdashboradComponent,
    EmployeeDashboardComponent,
    AdministrativesComponent,
    RegionsComponent,
    DistrictsComponent,
    StationsComponent,
    EmployeesComponent,
    AddEmployeeComponent,
    EmployeeDetailsComponent,
    EditEmployeeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
