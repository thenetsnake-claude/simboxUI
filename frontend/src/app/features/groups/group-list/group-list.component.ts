import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupsService } from '../../../core/services/groups.service';

@Component({
  selector: 'app-group-list',
  template: `
    <div class="group-list">
      <div class="header">
        <h2>Contact Groups</h2>
        <div class="actions">
          <button mat-raised-button color="accent" (click)="refreshFromSMSEagle()" [disabled]="refreshing">
            <mat-icon>sync</mat-icon>
            Refresh from SMSEagle
          </button>
          <button mat-raised-button color="primary" routerLink="/groups/new">
            <mat-icon>add</mat-icon>
            New Group
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field class="search-field">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search by name...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <div *ngIf="loading" class="loading">
            <mat-spinner></mat-spinner>
          </div>

          <table mat-table [dataSource]="groups" *ngIf="!loading" class="groups-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let group">{{ group.name }}</td>
            </ng-container>

            <ng-container matColumnDef="member_count">
              <th mat-header-cell *matHeaderCellDef>Members</th>
              <td mat-cell *matCellDef="let group">
                <mat-chip>{{ group.contacts?.length || 0 }} contacts</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="contacts">
              <th mat-header-cell *matHeaderCellDef>Contact Names</th>
              <td mat-cell *matCellDef="let group">
                <span *ngIf="group.contacts && group.contacts.length > 0">
                  {{ group.contacts.slice(0, 3).map((c: any) => c.name).join(', ') }}
                  <span *ngIf="group.contacts.length > 3"> +{{ group.contacts.length - 3 }} more</span>
                </span>
                <span *ngIf="!group.contacts || group.contacts.length === 0" class="empty-text">
                  No members
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let group">
                <button mat-icon-button [routerLink]="['/groups/edit', group.id]">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteGroup(group)">
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
    .group-list {
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

    .groups-table {
      width: 100%;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .empty-text {
      color: rgba(0, 0, 0, 0.4);
      font-style: italic;
    }
  `]
})
export class GroupListComponent implements OnInit {
  groups: any[] = [];
  loading = true;
  refreshing = false;
  searchTerm = '';
  page = 1;
  pageSize = 20;
  totalCount = 0;
  displayedColumns: string[] = ['name', 'member_count', 'contacts', 'actions'];

  constructor(
    private groupsService: GroupsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupsService.getGroups({
      page: this.page,
      limit: this.pageSize,
      search: this.searchTerm || undefined
    }).subscribe({
      next: (response) => {
        this.groups = response.groups;
        this.totalCount = response.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadGroups();
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadGroups();
  }

  refreshFromSMSEagle(): void {
    this.refreshing = true;
    this.groupsService.refreshFromSMSEagle().subscribe({
      next: () => {
        this.refreshing = false;
        this.loadGroups();
      },
      error: (error) => {
        console.error('Error refreshing from SMSEagle:', error);
        this.refreshing = false;
      }
    });
  }

  deleteGroup(group: any): void {
    if (confirm(`Are you sure you want to delete group "${group.name}"?`)) {
      this.groupsService.deleteGroup(group.id).subscribe({
        next: () => {
          this.loadGroups();
        },
        error: (error) => {
          console.error('Error deleting group:', error);
        }
      });
    }
  }
}
