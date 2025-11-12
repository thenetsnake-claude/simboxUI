import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModemsService } from '../../../core/services/modems.service';

@Component({
  selector: 'app-modem-list',
  template: `
    <div class="modem-list">
      <div class="header">
        <h2>Modem Settings</h2>
        <button mat-raised-button color="accent" (click)="refreshModems()" [disabled]="loading">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="!loading" class="modems-grid">
            <mat-card *ngFor="let modem of modems" class="modem-card">
              <mat-card-header>
                <mat-card-title>{{ modem.displayName }}</mat-card-title>
                <mat-card-subtitle>Modem #{{ modem.modem_no }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="modem-details">
                  <div class="detail-row">
                    <span class="label">Custom Name:</span>
                    <span class="value">{{ modem.custom_name || '(Not set)' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">SMSEagle ID:</span>
                    <span class="value">{{ modem.smseagle_id || 'N/A' }}</span>
                  </div>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary" [routerLink]="['/settings/modems/edit', modem.id]">
                  <mat-icon>edit</mat-icon>
                  Edit Name
                </button>
              </mat-card-actions>
            </mat-card>
          </div>

          <div *ngIf="!loading && modems.length === 0" class="empty-state">
            <mat-icon>signal_cellular_alt</mat-icon>
            <p>No modems found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .modem-list {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .modems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .modem-card {
      transition: box-shadow 0.2s;
    }

    .modem-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .modem-details {
      margin-top: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .detail-row .label {
      font-weight: 500;
      color: rgba(0,0,0,0.6);
    }

    .detail-row .value {
      color: rgba(0,0,0,0.87);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: rgba(0,0,0,0.4);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
  `]
})
export class ModemListComponent implements OnInit {
  modems: any[] = [];
  loading = true;

  constructor(
    private modemsService: ModemsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadModems();
  }

  loadModems(): void {
    this.loading = true;
    this.modemsService.getModems().subscribe({
      next: (modems) => {
        this.modems = modems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading modems:', error);
        this.loading = false;
      }
    });
  }

  refreshModems(): void {
    this.loadModems();
  }
}
