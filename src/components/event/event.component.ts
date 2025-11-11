import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './event.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventComponent implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private router = inject(Router);

  event = this.eventService.activeEvent;
  progress = this.eventService.userProgress;
  isGoalReached = this.eventService.isGoalReached;
  isRewardClaimed = this.eventService.isRewardClaimed;

  timeLeft = signal<TimeLeft | null>(null);
  notification = signal<string | null>(null);
  private timerInterval: any;
  
  progressPercentage = computed(() => {
    const currentEvent = this.event();
    const currentProgress = this.progress();
    if (!currentEvent || !currentProgress) return 0;
    return Math.min((currentProgress.score / currentEvent.goal) * 100, 100);
  });

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  private startCountdown(): void {
    const event = this.event();
    if (!event) return;

    const endDate = new Date(event.endDate).getTime();

    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance < 0) {
        clearInterval(this.timerInterval);
        this.timeLeft.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        this.timeLeft.set({ days, hours, minutes, seconds });
      }
    }, 1000);
  }

  participate(): void {
    this.router.navigate(['/quick-challenge'], { state: { eventChallenge: true } });
  }

  async claim(): Promise<void> {
    const success = await this.eventService.claimReward();
    if (success) {
      this.showNotification('¡Recompensas reclamadas con éxito!');
    } else {
      this.showNotification('No se pudieron reclamar las recompensas.');
    }
  }

  private showNotification(message: string): void {
    this.notification.set(message);
    setTimeout(() => this.notification.set(null), 4000);
  }
}
