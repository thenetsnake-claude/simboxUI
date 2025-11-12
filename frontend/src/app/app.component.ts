import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  template: `
    <div [class.dark-theme]="isDarkTheme$ | async">
      <app-header></app-header>
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #drawer mode="side" opened class="sidenav">
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        <mat-sidenav-content>
          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .sidenav-container {
      height: calc(100vh - 64px);
    }

    .sidenav {
      width: 250px;
    }

    .content {
      padding: 20px;
    }
  `]
})
export class AppComponent implements OnInit {
  isDarkTheme$ = this.themeService.isDarkTheme$;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.initTheme();
  }
}
