import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessagesService } from '../../../core/services/messages.service';

@Component({
  selector: 'app-conversation-detail',
  template: `
    <div class="conversation-detail">
      <div class="header">
        <button mat-icon-button routerLink="/messages/conversations">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ phoneNumber }}</h2>
        <button mat-icon-button (click)="refresh()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <mat-card class="messages-container">
        <div *ngIf="loading" class="loading">
          <mat-spinner></mat-spinner>
        </div>

        <div *ngIf="!loading" class="messages">
          <div *ngFor="let message of messages"
               [class.sent]="message.folder === 'sent' || message.folder === 'outbox'"
               [class.received]="message.folder === 'inbox'"
               class="message">
            <div class="message-bubble">
              <p>{{ message.text || '(Binary message)' }}</p>
              <span class="time">{{ message.sending_date || message.receive_date | date:'short' }}</span>
              <mat-chip *ngIf="message.status" class="status-chip">{{ message.status }}</mat-chip>
            </div>
          </div>
        </div>
      </mat-card>

      <mat-card class="send-form">
        <form [formGroup]="sendForm" (ngSubmit)="sendMessage()">
          <mat-form-field class="full-width">
            <mat-label>Message</mat-label>
            <textarea matInput
                      formControlName="text"
                      rows="3"
                      maxlength="2000"
                      placeholder="Type your message..."></textarea>
            <mat-hint align="end">{{ sendForm.get('text')?.value?.length || 0 }} / 2000</mat-hint>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="!sendForm.valid || sending">
              <mat-icon>send</mat-icon>
              Send
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .conversation-detail {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .messages-container {
      height: 500px;
      overflow-y: auto;
      padding: 20px;
      margin-bottom: 16px;
    }

    .messages {
      display: flex;
      flex-direction: column-reverse;
    }

    .message {
      margin-bottom: 16px;
      display: flex;
    }

    .message.sent {
      justify-content: flex-end;
    }

    .message.received {
      justify-content: flex-start;
    }

    .message-bubble {
      max-width: 70%;
      padding: 12px;
      border-radius: 8px;
    }

    .sent .message-bubble {
      background-color: #1976d2;
      color: white;
    }

    .received .message-bubble {
      background-color: #e0e0e0;
      color: black;
    }

    .time {
      font-size: 11px;
      opacity: 0.7;
      display: block;
      margin-top: 4px;
    }

    .status-chip {
      margin-top: 4px;
      font-size: 10px;
      height: 20px;
    }

    .send-form {
      padding: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
  `]
})
export class ConversationDetailComponent implements OnInit {
  phoneNumber!: string;
  messages: any[] = [];
  loading = true;
  sending = false;
  sendForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private messagesService: MessagesService,
    private fb: FormBuilder
  ) {
    this.sendForm = this.fb.group({
      text: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    this.phoneNumber = this.route.snapshot.params['phone'];
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.messagesService.getMessages({ phone_number: this.phoneNumber, limit: 100 }).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (this.sendForm.valid && !this.sending) {
      this.sending = true;
      this.messagesService.sendSms({
        to: [this.phoneNumber],
        text: this.sendForm.value.text,
        validity: '1h'
      }).subscribe({
        next: () => {
          this.sendForm.reset();
          this.sending = false;
          this.loadMessages();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.sending = false;
        }
      });
    }
  }

  refresh(): void {
    this.loadMessages();
  }
}
