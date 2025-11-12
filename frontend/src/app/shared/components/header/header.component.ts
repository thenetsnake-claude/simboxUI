import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar color="primary">
      <span>SMSEagle Web UI</span>
      <span class="spacer"></span>

      <button mat-icon-button (click)="toggleTheme()" matTooltip="Toggle theme">
        <mat-icon>{{ (themeService.isDarkTheme$ | async) ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <button mat-icon-button [matMenuTriggerFor]="userMenu" *ngIf="auth.isAuthenticated$ | async">
        <mat-icon>account_circle</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <div mat-menu-item disabled>
          <span>{{ (auth.user$ | async)?.name }}</span>
        </div>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>

      <button mat-button (click)="login()" *ngIf="(auth.isAuthenticated$ | async) === false">
        Login
      </button>
    </mat-toolbar>
  `,
  styles: []
})
export class HeaderComponent {
  constructor(
    public auth: AuthService,
    public themeService: ThemeService
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  login(): void {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout({ logoutParams: { returnTo: document.location.origin } });
  }
}
