import { Injectable, signal, inject, computed } from '@angular/core';
import { WeeklyEvent, EventProgress } from '../models/event.model';
import { AuthService } from './auth.service';

function getEndOfWeek(): Date {
  const now = new Date();
  const currentDay = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return endOfWeek;
}

// Helper to get ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Correctly calculate the week number
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Function to generate the active event with a dynamic ID
function generateActiveEvent(): WeeklyEvent {
  const now = new Date();
  const year = now.getFullYear();
  const week = getISOWeek(now);
  
  return {
    id: `prophets-trial-${year}-${week}`, // Dynamic ID based on the week
    title: 'La Prueba del Profeta',
    description: 'Los grandes reyes de Israel te desafían. Demuestra tu conocimiento sobre sus vidas y legados en este evento especial. ¡Consigue 10 respuestas correctas para ganar grandes recompensas!',
    themeCategory: 'Reyes - David',
    endDate: getEndOfWeek().toISOString(),
    goal: 10,
    rewards: {
      xp: 250,
      fe: 100,
      talents: 5,
    },
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private authService = inject(AuthService);
  private readonly progressKey = 'eventProgress';
  
  readonly activeEvent = signal<WeeklyEvent | null>(generateActiveEvent());
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
    if (event && (!progress || progress.eventId !== event.id)) {
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
     const event = this.activeEvent();
     if (event) {
        const newProgress = { eventId: event.id, score: 0, rewardClaimed: false };
        this.saveProgress(newProgress);
     } else {
        localStorage.removeItem(this.progressKey);
        this.userProgress.set(null);
     }
  }
}