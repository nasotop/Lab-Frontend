import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './core/guard/AuthGuard';
import { RoleGuard } from './core/guard/RoleGuard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'test-results',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'USER'] },
    loadComponent: () =>
      import(
        './features/test-results/test-result-page/test-result-page.component'
      ).then((m) => m.TestResultPageComponent),
  },

  {
    path: 'order-test',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'USER'] },
    loadComponent: () =>
      import(
        './features/order-test/order-test-page/order-test-page.component'
      ).then((m) => m.OrderTestPageComponent),
  },
  {
    path: 'orders',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'USER'] },
    loadComponent: () =>
      import('./features/order/order-page/order-page.component').then(
        (m) => m.OrderPageComponent
      ),
  },
  {
    path: 'patients',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'USER'] },
    loadComponent: () =>
      import('./features/patient/patient-page/patient-page.component').then(
        (m) => m.PatientPageComponent
      ),
  },
  {
    path: 'laboratories',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'USER'] },
    loadComponent: () =>
      import(
        './features/laboratory/laboratory-page/laboratory-page.component'
      ).then((m) => m.LaboratoryPageComponent),
  },
  {
    path: 'users',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/user/user-page/user-page.component').then(
        (m) => m.UserPageComponent
      ),
  },
  {
    path: 'test-types',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'USER'] },
    loadComponent: () =>
      import(
        './features/test-type/test-type-page/test-type-page.component'
      ).then((m) => m.TestTypePageComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
