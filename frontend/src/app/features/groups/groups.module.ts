import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MaterialModule } from '../../material.module';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupFormComponent } from './group-form/group-form.component';

const routes: Routes = [
  { path: '', component: GroupListComponent },
  { path: 'new', component: GroupFormComponent },
  { path: 'edit/:id', component: GroupFormComponent }
];

@NgModule({
  declarations: [
    GroupListComponent,
    GroupFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class GroupsModule { }
