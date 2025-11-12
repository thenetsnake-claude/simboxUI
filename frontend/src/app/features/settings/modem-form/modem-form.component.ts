import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModemsService } from '../../../core/services/modems.service';

@Component({
  selector: 'app-modem-form',
  template: `
    <div class="modem-form">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Edit Modem Name</mat-card-title>
          <mat-card-subtitle>Modem #{{ modemNo }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="modemForm" (ngSubmit)="saveModem()">
            <mat-form-field class="full-width">
              <mat-label>Custom Name</mat-label>
              <input matInput formControlName="custom_name" placeholder="e.g., Main Office Line">
              <mat-hint>Leave empty to use default name (Modem {{ modemNo }})</mat-hint>
            </mat-form-field>

            <div class="preview" *ngIf="modemForm.get('custom_name')?.value">
              <mat-label>Display Name Preview:</mat-label>
              <p class="preview-text">{{ getDisplayName() }}</p>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/settings/modems">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!modemForm.valid || saving">
                <mat-icon>save</mat-icon>
                Save
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .modem-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .preview {
      margin: 24px 0;
      padding: 16px;
      background-color: rgba(0,0,0,0.05);
      border-radius: 4px;
    }

    .preview mat-label {
      font-weight: 500;
      color: rgba(0,0,0,0.6);
    }

    .preview-text {
      margin-top: 8px;
      font-size: 18px;
      font-weight: 500;
      color: rgba(0,0,0,0.87);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class ModemFormComponent implements OnInit {
  modemForm: FormGroup;
  modemId?: number;
  modemNo?: number;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modemsService: ModemsService
  ) {
    this.modemForm = this.fb.group({
      custom_name: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.modemId = +id;
      this.loadModem();
    } else {
      this.router.navigate(['/settings/modems']);
    }
  }

  loadModem(): void {
    if (!this.modemId) return;

    this.modemsService.getModem(this.modemId).subscribe({
      next: (modem) => {
        this.modemNo = modem.modem_no;
        this.modemForm.patchValue({
          custom_name: modem.custom_name || ''
        });
      },
      error: (error) => {
        console.error('Error loading modem:', error);
        this.router.navigate(['/settings/modems']);
      }
    });
  }

  getDisplayName(): string {
    const customName = this.modemForm.get('custom_name')?.value;
    if (customName) {
      return `${customName} (${this.modemNo})`;
    }
    return `Modem ${this.modemNo}`;
  }

  saveModem(): void {
    if (this.modemForm.valid && !this.saving && this.modemId) {
      this.saving = true;
      const formValue = this.modemForm.value;

      this.modemsService.updateModem(this.modemId, formValue).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/settings/modems']);
        },
        error: (error) => {
          console.error('Error saving modem:', error);
          this.saving = false;
        }
      });
    }
  }
}
