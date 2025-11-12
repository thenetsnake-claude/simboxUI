import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MaterialModule } from '../../material.module';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ConversationDetailComponent } from './conversation-detail/conversation-detail.component';
import { SendSmsComponent } from './send-sms/send-sms.component';

const routes: Routes = [
  { path: 'conversations', component: ConversationListComponent },
  { path: 'conversation/:phone', component: ConversationDetailComponent },
  { path: 'send', component: SendSmsComponent }
];

@NgModule({
  declarations: [
    ConversationListComponent,
    ConversationDetailComponent,
    SendSmsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class MessagesModule { }
