import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../../../core/services/groups.service';
import { ContactsService } from '../../../core/services/contacts.service';

@Component({
  selector: 'app-group-form',
  template: `
    <div class="group-form">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Group' : 'New Group' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="groupForm" (ngSubmit)="saveGroup()">
            <mat-form-field class="full-width">
              <mat-label>Group Name</mat-label>
              <input matInput formControlName="name" placeholder="Sales Team" required>
              <mat-error *ngIf="groupForm.get('name')?.hasError('required')">
                Group name is required
              </mat-error>
            </mat-form-field>

            <div class="members-section">
              <h3>Members</h3>
              <mat-form-field class="full-width">
                <mat-label>Add Contacts</mat-label>
                <mat-select formControlName="contact_ids" multiple>
                  <mat-option *ngFor="let contact of availableContacts" [value]="contact.id">
                    {{ contact.name }} ({{ contact.phone_number }})
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <div *ngIf="selectedContacts.length > 0" class="selected-contacts">
                <mat-chip-set>
                  <mat-chip *ngFor="let contact of selectedContacts" (removed)="removeContact(contact.id)">
                    {{ contact.name }}
                    <button matChipRemove>
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/groups">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!groupForm.valid || saving">
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
    .group-form {
      max-width: 800px;
      margin: 0 auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .members-section {
      margin-top: 24px;
      margin-bottom: 24px;
    }

    .members-section h3 {
      margin-bottom: 16px;
    }

    .selected-contacts {
      margin-top: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class GroupFormComponent implements OnInit {
  groupForm: FormGroup;
  isEditMode = false;
  groupId?: number;
  saving = false;
  availableContacts: any[] = [];
  selectedContacts: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private contactsService: ContactsService
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      contact_ids: [[]]
    });
  }

  ngOnInit(): void {
    this.loadContacts();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.groupId = +id;
      this.loadGroup();
    }

    // Watch for contact selection changes
    this.groupForm.get('contact_ids')?.valueChanges.subscribe((contactIds: number[]) => {
      this.updateSelectedContacts(contactIds);
    });
  }

  loadContacts(): void {
    this.contactsService.getContacts({ limit: 1000 }).subscribe({
      next: (response) => {
        this.availableContacts = response.contacts;
      },
      error: (error) => console.error('Error loading contacts:', error)
    });
  }

  loadGroup(): void {
    if (!this.groupId) return;

    this.groupsService.getGroup(this.groupId).subscribe({
      next: (group) => {
        this.groupForm.patchValue({
          name: group.name,
          contact_ids: group.contacts?.map((c: any) => c.id) || []
        });
        this.updateSelectedContacts(group.contacts?.map((c: any) => c.id) || []);
      },
      error: (error) => {
        console.error('Error loading group:', error);
        this.router.navigate(['/groups']);
      }
    });
  }

  updateSelectedContacts(contactIds: number[]): void {
    this.selectedContacts = this.availableContacts.filter(c => contactIds.includes(c.id));
  }

  removeContact(contactId: number): void {
    const currentIds = this.groupForm.get('contact_ids')?.value || [];
    const newIds = currentIds.filter((id: number) => id !== contactId);
    this.groupForm.patchValue({ contact_ids: newIds });
  }

  saveGroup(): void {
    if (this.groupForm.valid && !this.saving) {
      this.saving = true;
      const formValue = this.groupForm.value;

      const request = this.isEditMode && this.groupId
        ? this.groupsService.updateGroup(this.groupId, formValue)
        : this.groupsService.createGroup(formValue);

      request.subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/groups']);
        },
        error: (error) => {
          console.error('Error saving group:', error);
          this.saving = false;
        }
      });
    }
  }
}
