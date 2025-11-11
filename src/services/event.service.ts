import { Injectable, signal, inject, computed } from '@angular/core';
import { WeeklyEvent, EventProgress } from '../models/event.model';
import { AuthService } from './auth.service';

const ACTIVE_EVENT: WeeklyEvent = {
  id: 'prophets-trial-1',
  title: 'La Prueba del Profeta',
  description: 'Los grandes reyes de Israel te desafían. Demuestra tu conocimiento sobre sus vidas y legados en este evento especial. ¡Consigue 10 respuestas correctas para ganar grandes recompensas!',
  themeCategory: 'Reyes - David', // Usaremos una categoría existente para las preguntas
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
  goal: 10,
  rewards: {
    xp: 250,
    fe: 100,
    talents: 5,
  },
};

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private authService = inject(AuthService);
  private readonly progressKey = 'eventProgress';
  
  readonly activeEvent = signal<WeeklyEvent | null>(ACTIVE_EVENT);
  readonly userProgress = signal<EventProgress | null>(this.loadProgress());

  readonly isGoalReached = computed(() => {
    const progress = this.userProgress();
    const event = this.activeEvent();
    return progress && event && progress.score >= event.goal;
  });

  readonly isRewardClaimed = computed(() => this.userProgress()?.rewardClaimed ?? false);

  constructor() {
    // Reset progress if the active event is different from the saved one
    const progress = this.userProgress();
    const event = this.activeEvent();
    if (event && progress && progress.eventId !== event.id) {
      this.resetProgress();
    }
  }

  private loadProgress(): EventProgress | null {
    try {
      const storedProgress = localStorage.getItem(this.progressKey);
      return storedProgress ? JSON.parse(storedProgress) : null;
    } catch (e) {
      console.error('Error loading event progress from localStorage', e);
      return null;
    }
  }

  private saveProgress(progress: EventProgress): void {
    try {
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
      this.userProgress.set(progress);
    } catch (e) {
      console.error('Error saving event progress to localStorage', e);
    }
  }
  
  recordCorrectAnswer(category: string): void {
    const event = this.activeEvent();
    if (!event || event.themeCategory !== category || this.isGoalReached()) {
      return;
    }
    
    let progress = this.userProgress();
    if (!progress || progress.eventId !== event.id) {
      progress = { eventId: event.id, score: 0, rewardClaimed: false };
    }
    
    progress.score += 1;
    this.saveProgress(progress);
  }

  async claimReward(): Promise<boolean> {
    const event = this.activeEvent();
    if (!event || !this.isGoalReached() || this.isRewardClaimed()) {
      return false;
    }
    
    try {
      await this.authService.incrementUserStats(event.rewards);
      const progress = this.userProgress();
      if(progress) {
        progress.rewardClaimed = true;
        this.saveProgress(progress);
      }
      return true;
    } catch (error) {
      console.error('Failed to claim event reward:', error);
      return false;
    }
  }

  resetProgress(): void {
     localStorage.removeItem(this.progressKey);
     this.userProgress.set(null);
  }
}
