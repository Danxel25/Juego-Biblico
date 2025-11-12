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
  private readonly themeKey = 'theme';
  
  private _settings = signal<AppSettings>(this.loadSettings());

  public readonly soundEffects = signal(this._settings().soundEffects);
  public readonly music = signal(this._settings().music);
  public readonly notifications = signal(this._settings().notifications);
  public readonly theme = signal<'light' | 'dark'>(this.loadTheme());

  constructor() {
    // Effect to save general settings whenever they change
    effect(() => {
      const currentSettings: AppSettings = {
        soundEffects: this.soundEffects(),
        music: this.music(),
        notifications: this.notifications()
      };
      localStorage.setItem(this.settingsKey, JSON.stringify(currentSettings));
    });

    // Effect to apply and save theme
    effect(() => {
      const currentTheme = this.theme();
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(this.themeKey, currentTheme);
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
  
  private loadTheme(): 'light' | 'dark' {
    try {
      const storedTheme = localStorage.getItem(this.themeKey);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    } catch (error) {
      console.error('Error loading theme from localStorage', error);
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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

  updateTheme(isDark: boolean): void {
    this.theme.set(isDark ? 'dark' : 'light');
  }
}