import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$: Observable<boolean> = this.darkThemeSubject.asObservable();

  constructor() {}

  initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    this.darkThemeSubject.next(isDark);
  }

  toggleTheme(): void {
    const newTheme = !this.darkThemeSubject.value;
    this.darkThemeSubject.next(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }

  get isDarkTheme(): boolean {
    return this.darkThemeSubject.value;
  }
}
