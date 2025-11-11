import { Injectable, signal, inject, computed } from '@angular/core';
import { WeeklyEvent, EventProgress } from '../models/event.model';
import { AuthService } from './auth.service';

function getEndOfWeek(): Date {
  const now = new Date();
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  const currentDay = now.getDay();
  // We want the week to end on Sunday.
  // If today is Monday (1), we need to add 6 days.
  // If today is Sunday (0), we need to add 0 days.
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  // Set time to 23:59:59.999 on that Sunday
  endOfWeek.setHours(23, 59, 59, 999);
  
  return endOfWeek;
}

const ACTIVE_EVENT: WeeklyEvent = {
  id: 'prophets-trial-1',
  title: 'La Prueba del Profeta',
  description: 'Los grandes reyes de Israel te desafían. Demuestra tu conocimiento sobre sus vidas y legados en este evento especial. ¡Consigue 10 respuestas correctas para ganar grandes recompensas!',
  themeCategory: 'Reyes - David', // Usaremos una categoría existente para las preguntas
  endDate: getEndOfWeek().toISOString(), // Ends on the next Sunday at midnight
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
    if (!event || event.themeCategory !== category) {
      return;
    }
    
    const currentProgress = this.userProgress();
    
    // Do not increment score if goal is already reached.
    if (currentProgress && currentProgress.score >= event.goal) {
        return;
    }
    
    const progressToUpdate = currentProgress && currentProgress.eventId === event.id 
      ? currentProgress 
      : { eventId: event.id, score: 0, rewardClaimed: false };
      
    const newProgress = { ...progressToUpdate, score: progressToUpdate.score + 1 };
    this.saveProgress(newProgress);
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
        const newProgress = { ...progress, rewardClaimed: true };
        this.saveProgress(newProgress);
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