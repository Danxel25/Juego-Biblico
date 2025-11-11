import { Injectable, signal, inject } from '@angular/core';
import { User } from '../models/user.model';
import { DataService } from './data.service';

export type LeaderboardCategory = 'level' | 'xp' | 'duels_won' | 'current_streak' | 'unlocked_achievements_count';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private dataService = inject(DataService);

  readonly leaderboards = signal<Record<LeaderboardCategory, User[]>>({
    level: [],
    xp: [],
    duels_won: [],
    current_streak: [],
    unlocked_achievements_count: [],
  });

  readonly isLoading = signal(false);

  async fetchAllLeaderboards(): Promise<void> {
    this.isLoading.set(true);
    try {
      const categories: LeaderboardCategory[] = ['level', 'xp', 'duels_won', 'current_streak', 'unlocked_achievements_count'];
      
      const results = await Promise.all(
        categories.map(category => this.dataService.getLeaderboard(category))
      );
      
      this.leaderboards.set({
        level: results[0],
        xp: results[1],
        duels_won: results[2],
        current_streak: results[3],
        unlocked_achievements_count: results[4],
      });

    } catch (error) {
      console.error("Failed to fetch leaderboards:", error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
