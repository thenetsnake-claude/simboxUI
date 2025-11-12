import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ContactsService } from '../../../core/services/contacts.service';

@Component({
  selector: 'app-contact-list',
  template: `
    <div class="contact-list">
      <div class="header">
        <h2>Contacts</h2>
        <div class="actions">
          <button mat-raised-button color="accent" (click)="refreshFromSMSEagle()" [disabled]="refreshing">
            <mat-icon>sync</mat-icon>
            Refresh from SMSEagle
          </button>
          <button mat-raised-button color="primary" routerLink="/contacts/new">
            <mat-icon>add</mat-icon>
            New Contact
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field class="search-field">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search by name or phone...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <div *ngIf="loading" class="loading">
            <mat-spinner></mat-spinner>
          </div>

          <table mat-table [dataSource]="contacts" *ngIf="!loading" class="contacts-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let contact">{{ contact.name }}</td>
            </ng-container>

            <ng-container matColumnDef="phone_number">
              <th mat-header-cell *matHeaderCellDef>Phone Number</th>
              <td mat-cell *matCellDef="let contact">{{ contact.phone_number }}</td>
            </ng-container>

            <ng-container matColumnDef="groups">
              <th mat-header-cell *matHeaderCellDef>Groups</th>
              <td mat-cell *matCellDef="let contact">
                <mat-chip-set>
                  <mat-chip *ngFor="let group of contact.groups">{{ group.name }}</mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let contact">
                <button mat-icon-button [routerLink]="['/contacts/edit', contact.id]">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteContact(contact)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalCount"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50, 100]"
            (page)="onPageChange($event)"
            *ngIf="!loading">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .contact-list {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .search-field {
      width: 100%;
      margin-bottom: 20px;
    }

    .contacts-table {
      width: 100%;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
  `]
})
export class ContactListComponent implements OnInit {
  contacts: any[] = [];
  loading = true;
  refreshing = false;
  searchTerm = '';
  page = 1;
  pageSize = 20;
  totalCount = 0;
  displayedColumns: string[] = ['name', 'phone_number', 'groups', 'actions'];

  constructor(
    private contactsService: ContactsService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    this.contactsService.getContacts({
      page: this.page,
      limit: this.pageSize,
      search: this.searchTerm || undefined
    }).subscribe({
      next: (response) => {
        this.contacts = response.contacts;
        this.totalCount = response.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadContacts();
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadContacts();
  }

  refreshFromSMSEagle(): void {
    this.refreshing = true;
    this.contactsService.refreshFromSMSEagle().subscribe({
      next: () => {
        this.refreshing = false;
        this.loadContacts();
      },
      error: (error) => {
        console.error('Error refreshing from SMSEagle:', error);
        this.refreshing = false;
      }
    });
  }

  deleteContact(contact: any): void {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.contactsService.deleteContact(contact.id).subscribe({
        next: () => {
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
        }
      });
    }
  }
}
