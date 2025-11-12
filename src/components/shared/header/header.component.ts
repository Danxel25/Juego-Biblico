import { Component, ChangeDetectionStrategy, signal, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class HeaderComponent {
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  private elementRef = inject(ElementRef);
  user = this.authService.currentUser;
  theme = this.settingsService.theme;
  
  isProfileMenuOpen = signal(false);
  isClosing = signal(false);

  onDocumentClick(event: MouseEvent): void {
    // Close only if the menu is open and the click is outside
    if (this.isProfileMenuOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeProfileMenu();
    }
  }

  toggleProfileMenu(): void {
    if (this.isProfileMenuOpen() && !this.isClosing()) {
        this.closeProfileMenu();
    } else if (!this.isProfileMenuOpen()) {
        this.isProfileMenuOpen.set(true);
    }
  }
  
  toggleTheme(): void {
    const isDark = this.theme() === 'dark';
    this.settingsService.updateTheme(!isDark);
  }

  closeProfileMenu(): void {
    if (!this.isProfileMenuOpen() || this.isClosing()) return;

    this.isClosing.set(true);
    setTimeout(() => {
      this.isProfileMenuOpen.set(false);
      this.isClosing.set(false);
    }, 200); // Corresponds to animation duration
  }

  logout(): void {
    this.closeProfileMenu();
    // Wait for the animation to finish before logging out,
    // which navigates the user away.
    setTimeout(() => {
        this.authService.logout();
    }, 200);
  }
}