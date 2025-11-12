import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MaterialModule } from '../../material.module';
import { ModemListComponent } from './modem-list/modem-list.component';
import { ModemFormComponent } from './modem-form/modem-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'modems', pathMatch: 'full' },
  { path: 'modems', component: ModemListComponent },
  { path: 'modems/edit/:id', component: ModemFormComponent }
];

@NgModule({
  declarations: [
    ModemListComponent,
    ModemFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class SettingsModule { }
