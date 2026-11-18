import { Component, inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthService } from './login/auth.service';
import { Mesas } from './mesas/mesas';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { Personal } from './personal/personal';

@Component({
  selector: 'app-route-placeholder',
  standalone: true,
  template: '',
})
class RoutePlaceholder {}

const requireLogin: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated ? true : router.parseUrl('/login');
};

export const routes: Routes = [
  { path: '', component: RoutePlaceholder, pathMatch: 'full', canActivate: [requireLogin] },
  { path: 'login', component: LoginComponent },
  { path: 'mesas', component: Mesas, canActivate: [requireLogin] },
  { path: 'personal', component: Personal, canActivate: [requireLogin] },
  { path: 'payment-history', component: PaymentHistoryComponent, canActivate: [requireLogin] },
  { path: '**', redirectTo: 'login' },
];
