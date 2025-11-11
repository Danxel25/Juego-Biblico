import { Injectable, signal, effect } from '@angular/core';

export interface AppSettings {
  soundEffects: boolean;
  music: boolean;
  notifications: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEffects: true,
  music: true,
  notifications: false,
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly settingsKey = 'appSettings';
  
  private _settings = signal<AppSettings>(this.loadSettings());

  public readonly soundEffects = signal(this._settings().soundEffects);
  public readonly music = signal(this._settings().music);
  public readonly notifications = signal(this._settings().notifications);

  constructor() {
    // Effect to save settings whenever they change
    effect(() => {
      const currentSettings: AppSettings = {
        soundEffects: this.soundEffects(),
        music: this.music(),
        notifications: this.notifications()
      };
      localStorage.setItem(this.settingsKey, JSON.stringify(currentSettings));
    });
  }

  private loadSettings(): AppSettings {
    try {
      const storedSettings = localStorage.getItem(this.settingsKey);
      if (storedSettings) {
        // Basic validation to ensure the stored object has the expected keys
        const parsed = JSON.parse(storedSettings);
        if ('soundEffects' in parsed && 'music' in parsed && 'notifications' in parsed) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading settings from localStorage', error);
    }
    return DEFAULT_SETTINGS;
  }
  
  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    switch (key) {
      case 'soundEffects':
        this.soundEffects.set(value as boolean);
        break;
      case 'music':
        this.music.set(value as boolean);
        break;
      case 'notifications':
        this.notifications.set(value as boolean);
        break;
    }
  }
}
