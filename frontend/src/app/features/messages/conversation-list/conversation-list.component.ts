import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessagesService } from '../../../core/services/messages.service';

@Component({
  selector: 'app-conversation-list',
  template: `
    <div class="conversation-list">
      <div class="header">
        <h2>Conversations</h2>
        <button mat-raised-button color="primary" routerLink="/messages/send">
          <mat-icon>add</mat-icon>
          Send SMS
        </button>
      </div>

      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>

      <mat-card *ngFor="let conv of conversations" class="conversation-card" (click)="openConversation(conv.phone_number)">
        <mat-card-content>
          <div class="conversation-header">
            <h3>{{ conv.phone_number }}</h3>
            <mat-chip *ngIf="conv.unread_count > 0" color="accent">
              {{ conv.unread_count }} unread
            </mat-chip>
          </div>
          <p class="last-message">{{ conv.last_message?.text || '(Binary message)' }}</p>
          <span class="timestamp">{{ conv.last_activity | date:'short' }}</span>
        </mat-card-content>
      </mat-card>

      <mat-paginator
        [length]="totalCount"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 20, 50]"
        (page)="onPageChange($event)"
        *ngIf="!loading">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .conversation-list {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .conversation-card {
      margin-bottom: 16px;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }

    .conversation-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .last-message {
      color: rgba(0,0,0,0.6);
      margin: 8px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .timestamp {
      font-size: 12px;
      color: rgba(0,0,0,0.4);
    }

    .loading-card {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
  `]
})
export class ConversationListComponent implements OnInit {
  conversations: any[] = [];
  loading = true;
  page = 1;
  pageSize = 20;
  totalCount = 0;

  constructor(
    private messagesService: MessagesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loading = true;
    this.messagesService.getConversations(this.page, this.pageSize).subscribe({
      next: (response) => {
        this.conversations = response.conversations;
        this.totalCount = response.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.loading = false;
      }
    });
  }

  openConversation(phone: string): void {
    this.router.navigate(['/messages/conversation', phone]);
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadConversations();
  }
}
