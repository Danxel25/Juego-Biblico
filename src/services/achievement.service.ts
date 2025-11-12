import { Injectable, signal, inject } from '@angular/core';
import { Achievement } from '../models/achievement.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private authService = inject(AuthService);
  private soundService = inject(SoundService);

  private readonly _allAchievements = signal<Achievement[]>([
    { id: 'genesis_complete', title: 'Creador de Mundos', description: 'Completa la Tierra de la Creación.', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945C17.05 7.055 13.945 4 10 4S2.95 7.055 3.055 11zM10 20a5 5 0 100-10 5 5 0 000 10z' },
    { id: 'first_win', title: 'Primer Duelo Ganado', description: 'Gana tu primer Duelo Celestial.', icon: 'M15.182 6.718a4.5 4.5 0 01-6.364 0M15.182 17.282a4.5 4.5 0 01-6.364 0M11.03 12.37a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 010-1.06l4.24-4.242a.75.75 0 011.06 0l1.06 1.06a.75.75 0 010 1.06l-4.24 4.242zM12.44 11.03a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06 0l-4.242-4.24a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 0l4.242 4.24z' },
    { id: 'ten_correct_answers', title: 'Sabiduría Creciente', description: 'Responde 10 preguntas correctamente.', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
    { id: 'level_5', title: 'Estudiante de la Palabra', description: 'Alcanza el nivel 5.', icon: 'M9.5 14.25l-2.586-2.586a.75.75 0 011.06-1.06L9.5 12.12l4.524-4.524a.75.75 0 011.06 1.06L9.5 14.25zM12 21a9 9 0 100-18 9 9 0 000 18z' },
    { id: 'ten_duels_won', title: 'Campeón Celestial', description: 'Gana 10 Duelos Celestiales.', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.197-5.975' },
    { id: 'master_scholar', title: 'Maestro Erudito', description: 'Alcanza el nivel 20.', icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z' }
  ]);
  
  public readonly achievementUnlocked = signal<Achievement | null>(null);
  public readonly allAchievements = this._allAchievements.asReadonly();

  constructor() { }

  async checkForUnlock(user: User): Promise<void> {
    const unlocked = user.unlockedAchievements || [];

    for (const ach of this.allAchievements()) {
      if (unlocked.includes(ach.id)) {
        continue;
      }

      let shouldUnlock = false;
      switch (ach.id) {
        case 'genesis_complete':
          // NOTE: A more robust check would involve checking if all levels in the land are complete.
          // This requires campaign progress to be part of the User model.
          // For now, let's tie it to completing level 3.
          if (user.unlockedAchievements?.includes('level_3_completed')) shouldUnlock = true;
          break;
        case 'first_win':
          if ((user.duelsWon ?? 0) >= 1) shouldUnlock = true;
          break;
        case 'ten_correct_answers':
           if ((user.correctAnswers ?? 0) >= 10) shouldUnlock = true;
          break;
        case 'level_5':
          if (user.level >= 5) shouldUnlock = true;
          break;
        case 'ten_duels_won':
          if ((user.duelsWon ?? 0) >= 10) shouldUnlock = true;
          break;
        case 'master_scholar':
          if (user.level >= 20) shouldUnlock = true;
          break;
      }

      if (shouldUnlock) {
        await this.authService.unlockAchievement(ach.id);
        this.notify(ach);
        // Important: Stop after one to avoid multiple notifications at once.
        // The check will run again on the next user update.
        return;
      }
    }
  }

  private notify(achievement: Achievement): void {
    this.achievementUnlocked.set(achievement);
    this.soundService.playSound('achievement');
    setTimeout(() => this.achievementUnlocked.set(null), 5000); // Notification visible for 5 seconds
  }
}
