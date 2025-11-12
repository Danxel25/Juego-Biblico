import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  settingsService = inject(SettingsService);
  authService = inject(AuthService);
  user = this.authService.currentUser;

  soundEffects = this.settingsService.soundEffects;
  music = this.settingsService.music;
  notifications = this.settingsService.notifications;
  theme = this.settingsService.theme;

  updateSoundEffects(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.settingsService.updateSetting('soundEffects', value);
  }

  updateMusic(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.settingsService.updateSetting('music', value);
  }

  updateNotifications(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.settingsService.updateSetting('notifications', value);
  }

  updateTheme(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.settingsService.updateTheme(isChecked);
  }
  
  logout(): void {
    this.authService.logout();
  }
}