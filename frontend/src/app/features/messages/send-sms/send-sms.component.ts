import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessagesService } from '../../../core/services/messages.service';
import { ContactsService } from '../../../core/services/contacts.service';
import { GroupsService } from '../../../core/services/groups.service';
import { ModemsService } from '../../../core/services/modems.service';

@Component({
  selector: 'app-send-sms',
  template: `
    <div class="send-sms">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Send SMS</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="smsForm" (ngSubmit)="sendSms()">
            <mat-form-field class="full-width">
              <mat-label>Phone Number (optional)</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="+1234567890">
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Contacts (optional)</mat-label>
              <mat-select formControlName="contacts" multiple>
                <mat-option *ngFor="let contact of contacts" [value]="contact.id">
                  {{ contact.name }} ({{ contact.phone_number }})
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Groups (optional)</mat-label>
              <mat-select formControlName="groups" multiple>
                <mat-option *ngFor="let group of groups" [value]="group.id">
                  {{ group.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Message</mat-label>
              <textarea matInput
                        formControlName="text"
                        rows="5"
                        maxlength="2000"
                        placeholder="Type your message..."></textarea>
              <mat-hint align="end">{{ smsForm.get('text')?.value?.length || 0 }} / 2000</mat-hint>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field>
                <mat-label>Encoding</mat-label>
                <mat-select formControlName="encoding">
                  <mat-option value="standard">Standard</mat-option>
                  <mat-option value="unicode">Unicode</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Validity</mat-label>
                <mat-select formControlName="validity">
                  <mat-option value="5m">5 minutes</mat-option>
                  <mat-option value="10m">10 minutes</mat-option>
                  <mat-option value="30m">30 minutes</mat-option>
                  <mat-option value="1h">1 hour</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Modem</mat-label>
                <mat-select formControlName="modem_no">
                  <mat-option [value]="null">Auto</mat-option>
                  <mat-option *ngFor="let modem of modems" [value]="modem.modem_no">
                    {{ modem.displayName }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/messages/conversations">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!smsForm.valid || sending">
                <mat-icon>send</mat-icon>
                Send SMS
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .send-sms {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class SendSmsComponent implements OnInit {
  smsForm: FormGroup;
  sending = false;
  contacts: any[] = [];
  groups: any[] = [];
  modems: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messagesService: MessagesService,
    private contactsService: ContactsService,
    private groupsService: GroupsService,
    private modemsService: ModemsService
  ) {
    this.smsForm = this.fb.group({
      phoneNumber: [''],
      contacts: [[]],
      groups: [[]],
      text: ['', [Validators.required, Validators.maxLength(2000)]],
      encoding: ['standard'],
      validity: ['1h'],
      modem_no: [null]
    });
  }

  ngOnInit(): void {
    this.loadContacts();
    this.loadGroups();
    this.loadModems();
  }

  loadContacts(): void {
    this.contactsService.getContacts({ limit: 100 }).subscribe({
      next: (response) => this.contacts = response.contacts,
      error: (error) => console.error('Error loading contacts:', error)
    });
  }

  loadGroups(): void {
    this.groupsService.getGroups({ limit: 100 }).subscribe({
      next: (response) => this.groups = response.groups,
      error: (error) => console.error('Error loading groups:', error)
    });
  }

  loadModems(): void {
    this.modemsService.getModems().subscribe({
      next: (modems) => this.modems = modems,
      error: (error) => console.error('Error loading modems:', error)
    });
  }

  sendSms(): void {
    if (this.smsForm.valid && !this.sending) {
      this.sending = true;
      const formValue = this.smsForm.value;

      const payload: any = {
        text: formValue.text,
        encoding: formValue.encoding,
        validity: formValue.validity
      };

      if (formValue.phoneNumber) {
        payload.to = [formValue.phoneNumber];
      }
      if (formValue.contacts.length > 0) {
        payload.contacts = formValue.contacts;
      }
      if (formValue.groups.length > 0) {
        payload.groups = formValue.groups;
      }
      if (formValue.modem_no) {
        payload.modem_no = formValue.modem_no;
      }

      this.messagesService.sendSms(payload).subscribe({
        next: () => {
          this.sending = false;
          this.router.navigate(['/messages/conversations']);
        },
        error: (error) => {
          console.error('Error sending SMS:', error);
          this.sending = false;
        }
      });
    }
  }
}
