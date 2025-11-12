import { Injectable, inject } from '@angular/core';
import { SettingsService } from './settings.service';

export type SoundType = 
  | 'correct' 
  | 'incorrect' 
  | 'achievement' 
  | 'level_complete' 
  | 'ui_click' 
  | 'notification' 
  | 'purchase';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private settingsService = inject(SettingsService);
  private audioCache: { [key in SoundType]?: HTMLAudioElement } = {};
  private audioUnlocked = false;

  private soundMap: { [key in SoundType]: string } = {
    correct: 'https://storage.googleapis.com/maker-suite-media/codelab-assets/generative_ai_integration/sound_correct.mp3',
    incorrect: 'https://storage.googleapis.com/maker-suite-media/codelab-assets/generative_ai_integration/sound_error.mp3',
    achievement: 'https://storage.googleapis.com/maker-suite-media/codelab-assets/generative_ai_integration/sound_achievement.mp3',
    level_complete: 'https://storage.googleapis.com/maker-suite-media/codelab-assets/generative_ai_integration/sound_level_up.mp3',
    ui_click: 'https://storage.googleapis.com/maker-suite-media/codelab-assets/generative_ai_integration/sound_button_click.mp3',
    notification: 'https://storage.googleapis.com/maker-suite-media/codelab-assets/generative_ai_integration/sound_notification.mp3',
    purchase: 'https://storage.googleapis.com/maker-suite-media/codelab-assets/generative_ai_integration/sound_purchase.mp3'
  };

  constructor() {
    // La precarga se difiere hasta la interacción del usuario para cumplir con las políticas de reproducción automática.
  }
  
  public unlockAudio(): void {
    if (this.audioUnlocked) {
      return;
    }
    this.audioUnlocked = true;
    this.preloadSounds();
  }

  private preloadSounds(): void {
    if (!this.settingsService.soundEffects()) {
      return;
    }
    
    (Object.keys(this.soundMap) as SoundType[]).forEach(key => {
      if (!this.audioCache[key]) {
        try {
          const audio = new Audio(this.soundMap[key]);
          audio.load();
          this.audioCache[key] = audio;
        } catch (error) {
           console.error(`Could not preload sound: ${key}`, error);
        }
      }
    });
  }

  playSound(type: SoundType): void {
    if (!this.settingsService.soundEffects() || !this.audioUnlocked) {
      return;
    }

    const audio = this.audioCache[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => console.warn(`Could not play sound: ${type}. User interaction might be needed.`, error));
    } else {
      // Fallback si la precarga falló o se habilitó después de la carga inicial.
      try {
        const newAudio = new Audio(this.soundMap[type]);
        this.audioCache[type] = newAudio;
        newAudio.play().catch(error => console.warn(`Could not play sound: ${type}. User interaction might be needed.`, error));
      } catch (error) {
        console.error(`Could not create and play sound: ${type}`, error);
      }
    }
  }
}