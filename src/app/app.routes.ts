import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Mesas } from './mesas/mesas';
import { Personal } from './personal/personal';

@Component({
  selector: 'app-route-placeholder',
  standalone: true,
  template: '',
})
class RoutePlaceholder {}

export const routes: Routes = [
  { path: '', component: RoutePlaceholder, pathMatch: 'full' },
  { path: 'mesas', component: Mesas },
  { path: 'personal', component: Personal },
  { path: '**', redirectTo: '' },
];
