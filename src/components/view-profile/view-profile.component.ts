import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { AchievementService } from '../../services/achievement.service';
import { User } from '../../models/user.model';
import { Achievement } from '../../models/achievement.model';
import { PresenceService } from '../../services/presence.service';
// Fix: Import `toSignal` for reactive state management.
import { toSignal } from '@angular/core/rxjs-interop';

interface DisplayAchievement extends Achievement {
  unlocked: boolean;
}

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './view-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// Fix: Removed OnDestroy as it's no longer needed with toSignal.
export class ViewProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private achievementService = inject(AchievementService);
  private presenceService = inject(PresenceService);

  currentUser = this.authService.currentUser;
  viewedUser = signal<User | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  notification = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  // Presence State
  // Fix: Convert the presence observable into a signal.
  private presenceState = toSignal(this.presenceService.presenceState$, { initialValue: {} });
  // Fix: Create a computed signal for online status that reacts to changes in viewedUser or presenceState.
  isViewedUserOnline = computed(() => {
    const viewed = this.viewedUser();
    const state = this.presenceState();
    if (!viewed || !state) {
      return false;
    }
    return Object.keys(state).includes(viewed.uid);
  });

  // Achievement data
  private allAchievements = this.achievementService.allAchievements;
  
  unlockedIds = computed(() => new Set(this.viewedUser()?.unlockedAchievements || []));
  
  achievementsForDisplay = computed((): DisplayAchievement[] => {
    const unlocked = this.unlockedIds();
    return this.allAchievements().map(ach => ({
      ...ach,
      unlocked: unlocked.has(ach.id)
    }));
  });

  xpPercentage = computed(() => {
    const u = this.viewedUser();
    if (!u) return 0;
    const requiredXp = u.level * 1000;
    return (u.xp / requiredXp) * 100;
  });

  isOwnProfile = computed(() => this.currentUser()?.uid === this.viewedUser()?.uid);

  friendStatus = computed(() => {
    const current = this.currentUser();
    const viewed = this.viewedUser();
    if (!current || !viewed) return 'loading';
    if (current.uid === viewed.uid) return 'own_profile';
    if (current.friends?.includes(viewed.uid)) return 'friends';
    if (current.friendRequestsSent?.includes(viewed.uid)) return 'request_sent';
    if (current.friendRequestsReceived?.includes(viewed.uid)) return 'request_received';
    return 'not_friends';
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('userId');
      if (!userId) {
        this.router.navigate(['/main-menu']);
        return;
      }

      if (this.currentUser()?.uid === userId) {
        this.router.navigate(['/profile']);
        return;
      }

      this.loadUserProfile(userId);
    });
  }

  async loadUserProfile(userId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const userProfile = await this.dataService.getUser(userId);
      if (userProfile) {
        this.viewedUser.set(userProfile);
        // Fix: Removed the problematic synchronous call. The computed signal 'isViewedUserOnline' now handles this reactively.
      } else {
        this.errorMessage.set('No se pudo encontrar el perfil de este usuario.');
      }
    } catch (error) {
      this.errorMessage.set('Ocurrió un error al cargar el perfil.');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async sendFriendRequest(): Promise<void> {
    const viewed = this.viewedUser();
    const current = this.currentUser();
    if (!viewed || !current) return;

    try {
      await this.dataService.sendFriendRequest(current.uid, viewed.uid);
      // Optimistically update current user's state
      this.authService.currentUser.update(u => u ? { ...u, friendRequestsSent: [...(u.friendRequestsSent || []), viewed.uid] } : null);
      this.showNotification(`Solicitud enviada a ${viewed.customName}`, 'success');
    } catch (error) {
      this.showNotification('Error al enviar la solicitud.', 'error');
    }
  }
  
  async removeFriend(): Promise<void> {
    const viewed = this.viewedUser();
    const current = this.currentUser();
    if (!viewed || !current) return;
    
    try {
      await this.dataService.removeFriend(current.uid, viewed.uid);
      this.authService.currentUser.update(u => u ? { ...u, friends: u.friends?.filter(id => id !== viewed.uid) } : null);
      this.showNotification(`${viewed.customName} ha sido eliminado de tus amigos.`, 'success');
    } catch (error) {
      this.showNotification('Error al eliminar amigo.', 'error');
    }
  }

  goBack(): void {
    window.history.back();
  }
  
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 4000);
  }
}