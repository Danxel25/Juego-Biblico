import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaderboardService, LeaderboardCategory } from '../../services/leaderboard.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './leaderboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  leaderboardService = inject(LeaderboardService);
  authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  
  activeTab = signal<LeaderboardCategory>('level');
  lastUpdated = signal<Date | null>(null);
  isLoading = computed(() => this.leaderboardService.isLoading());
  
  private refreshInterval: any;

  tabs: { key: LeaderboardCategory; name: string; icon: string }[] = [
    { key: 'level', name: 'Nivel', icon: 'M9 11.25l1.5 1.5l3-3.75' },
    { key: 'xp', name: 'Experiencia', icon: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048' },
    { key: 'duels_won', name: 'Duelos Ganados', icon: 'M15.182 6.718a4.5 4.5 0 01-6.364 0' },
    { key: 'current_streak', name: 'Racha de Días', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v11.25' },
    { key: 'unlocked_achievements_count', name: 'Logros', icon: 'M16.5 18.75h-9a9.75 9.75 0 100-12.75h9' },
  ];
  
  currentLeaderboard = computed(() => {
    return this.leaderboardService.leaderboards()[this.activeTab()];
  });

  ngOnInit(): void {
    this.fetchData();
    this.refreshInterval = setInterval(() => this.fetchData(), 2 * 60 * 1000); // 2 minutes
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  fetchData(): void {
    this.leaderboardService.fetchAllLeaderboards();
    this.lastUpdated.set(new Date());
  }

  setActiveTab(tab: LeaderboardCategory): void {
    this.activeTab.set(tab);
  }

  getScore(user: User): number | string {
    switch (this.activeTab()) {
        case 'level': return user.level;
        case 'xp': return user.xp;
        case 'duels_won': return user.duelsWon ?? 0;
        case 'current_streak': return user.currentStreak ?? 0;
        case 'unlocked_achievements_count': return (user.unlockedAchievements as any)?.length ?? 0;
        default: return '-';
    }
  }
}
