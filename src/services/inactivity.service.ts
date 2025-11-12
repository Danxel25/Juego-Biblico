import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Subscription, merge } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityService implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  private timer: any;
  private readonly inactivityPeriod = 5 * 60 * 1000; // 5 minutes
  private activitySubscription: Subscription | null = null;
  private isRunning = false;

  constructor() {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.ngZone.runOutsideAngular(() => {
        const activityEvents$ = merge(
            fromEvent(window, 'mousemove'),
            fromEvent(window, 'mousedown'),
            fromEvent(window, 'keydown'),
            fromEvent(window, 'touchstart'),
            fromEvent(window, 'scroll')
        ).pipe(throttleTime(1000));

        this.activitySubscription = activityEvents$.subscribe(() => this.resetTimer());
    });

    this.resetTimer();
  }

  private resetTimer(): void {
    if (!this.isRunning) return;
    
    this.ngZone.runOutsideAngular(() => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.ngZone.run(() => {
          if (this.authService.isAuthenticated()) {
            this.authService.logout();
            this.router.navigate(['/auth'], { queryParams: { reason: 'inactivity' } });
          }
        });
      }, this.inactivityPeriod);
    });
  }

  stop(): void {
    clearTimeout(this.timer);
    this.activitySubscription?.unsubscribe();
    this.activitySubscription = null;
    this.isRunning = false;
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
