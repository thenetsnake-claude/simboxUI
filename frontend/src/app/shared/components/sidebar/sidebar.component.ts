import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  template: `
    <mat-nav-list>
      <a mat-list-item routerLink="/messages/conversations" routerLinkActive="active">
        <mat-icon matListItemIcon>message</mat-icon>
        <span matListItemTitle>Messages</span>
      </a>

      <a mat-list-item routerLink="/contacts" routerLinkActive="active">
        <mat-icon matListItemIcon>contacts</mat-icon>
        <span matListItemTitle>Contacts</span>
      </a>

      <a mat-list-item routerLink="/groups" routerLinkActive="active">
        <mat-icon matListItemIcon>group</mat-icon>
        <span matListItemTitle>Groups</span>
      </a>

      <mat-divider *ngIf="isAdmin$ | async"></mat-divider>

      <a mat-list-item routerLink="/settings" routerLinkActive="active" *ngIf="isAdmin$ | async">
        <mat-icon matListItemIcon>settings</mat-icon>
        <span matListItemTitle>Settings</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class SidebarComponent {
  isAdmin$ = this.auth.user$.pipe(
    map(user => user?.['role'] === 'admin')
  );

  constructor(public auth: AuthService) {}
}
