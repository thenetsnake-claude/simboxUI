import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../../../core/services/contacts.service';
import { GroupsService } from '../../../core/services/groups.service';

@Component({
  selector: 'app-contact-form',
  template: `
    <div class="contact-form">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Contact' : 'New Contact' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="contactForm" (ngSubmit)="saveContact()">
            <mat-form-field class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="John Doe" required>
              <mat-error *ngIf="contactForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone_number" placeholder="+1234567890" required>
              <mat-error *ngIf="contactForm.get('phone_number')?.hasError('required')">
                Phone number is required
              </mat-error>
              <mat-error *ngIf="contactForm.get('phone_number')?.hasError('pattern')">
                Phone number must start with + and contain only digits
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Groups</mat-label>
              <mat-select formControlName="group_ids" multiple>
                <mat-option *ngFor="let group of groups" [value]="group.id">
                  {{ group.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/contacts">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!contactForm.valid || saving">
                <mat-icon>save</mat-icon>
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .contact-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class ContactFormComponent implements OnInit {
  contactForm: FormGroup;
  isEditMode = false;
  contactId?: number;
  saving = false;
  groups: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private contactsService: ContactsService,
    private groupsService: GroupsService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone_number: ['', [Validators.required, Validators.pattern(/^\+\d+$/)]],
      group_ids: [[]]
    });
  }

  ngOnInit(): void {
    this.loadGroups();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.contactId = +id;
      this.loadContact();
    }
  }

  loadGroups(): void {
    this.groupsService.getGroups({ limit: 100 }).subscribe({
      next: (response) => this.groups = response.groups,
      error: (error) => console.error('Error loading groups:', error)
    });
  }

  loadContact(): void {
    if (!this.contactId) return;

    this.contactsService.getContact(this.contactId).subscribe({
      next: (contact) => {
        this.contactForm.patchValue({
          name: contact.name,
          phone_number: contact.phone_number,
          group_ids: contact.groups?.map((g: any) => g.id) || []
        });
      },
      error: (error) => {
        console.error('Error loading contact:', error);
        this.router.navigate(['/contacts']);
      }
    });
  }

  saveContact(): void {
    if (this.contactForm.valid && !this.saving) {
      this.saving = true;
      const formValue = this.contactForm.value;

      const request = this.isEditMode && this.contactId
        ? this.contactsService.updateContact(this.contactId, formValue)
        : this.contactsService.createContact(formValue);

      request.subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/contacts']);
        },
        error: (error) => {
          console.error('Error saving contact:', error);
          this.saving = false;
        }
      });
    }
  }
}
