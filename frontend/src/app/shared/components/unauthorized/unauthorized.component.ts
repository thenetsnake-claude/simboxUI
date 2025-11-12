import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-header>
          <mat-icon class="error-icon">block</mat-icon>
        </mat-card-header>
        <mat-card-content>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <p>Please contact your administrator if you believe this is an error.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="goHome()">
            <mat-icon>home</mat-icon>
            Go to Home
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    .unauthorized-card {
      max-width: 500px;
      text-align: center;
    }

    .error-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
      margin: 20px auto;
    }

    h1 {
      font-size: 32px;
      margin: 20px 0;
      color: rgba(0,0,0,0.87);
    }

    p {
      font-size: 16px;
      color: rgba(0,0,0,0.6);
      margin-bottom: 12px;
    }

    mat-card-actions {
      padding: 20px;
      justify-content: center;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/messages/conversations']);
  }
}
