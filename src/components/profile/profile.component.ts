import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AchievementService } from '../../services/achievement.service';
import { ProfileService } from '../../services/profile.service';
import { MottoVerse } from '../../models/profile.model';
import { User } from '../../models/user.model';
import { Achievement } from '../../models/achievement.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../services/data.service';
import { PresenceService } from '../../services/presence.service';
import { SoundService } from '../../services/sound.service';
import { Subject, debounceTime } from 'rxjs';

interface DisplayAchievement extends Achievement {
  unlocked: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private achievementService = inject(AchievementService);
  private profileService = inject(ProfileService);
  private dataService = inject(DataService);
  private presenceService = inject(PresenceService);
  private soundService = inject(SoundService);
  private fb: FormBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  private resolvedData = toSignal(this.route.data);
  user = computed(() => (this.resolvedData()?.['user'] as User | null));
  
  // Customization options from service
  avatars = this.profileService.avatars;
  mottoVerses = this.profileService.mottoVerses;
  allTitles = this.profileService.allTitles;
  
  // Achievement data
  allAchievements = this.achievementService.allAchievements;
  unlockedIds = computed(() => new Set(this.user()?.unlockedAchievements || []));

  achievementsForDisplay = computed((): DisplayAchievement[] => {
    const unlocked = this.unlockedIds();
    return this.allAchievements().map(ach => ({
      ...ach,
      unlocked: unlocked.has(ach.id)
    }));
  });
  
  // Tab Management
  activeTab = signal<'profile' | 'achievements' | 'friends'>('profile');

  // Modal visibility state
  showAvatarSelection = signal(false);
  showMottoSelection = signal(false);
  showTitleSelection = signal(false);
  notification = signal<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Personal Info editing
  isEditingProfile = signal(false);
  personalInfoForm: FormGroup;
  countries = ["Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", "España", "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico", "República Dominicana", "Uruguay", "Venezuela", "Otro"];

  // Friends State
  friends = signal<User[]>([]);
  incomingRequests = signal<User[]>([]);
  searchResults = signal<User[]>([]);
  searchQuery = signal('');
  private searchSubject = new Subject<string>();
  private presenceState = toSignal(this.presenceService.presenceState$, { initialValue: {} });
  onlineFriendIds = computed(() => new Set(Object.keys(this.presenceState())));
  
  // Computed values
  friendIds = computed(() => new Set(this.friends().map(f => f.uid)));
  requestIds = computed(() => new Set(this.incomingRequests().map(r => r.uid)));
  sentRequestIds = computed(() => new Set(this.user()?.friendRequestsSent || []));

  xpPercentage = computed(() => {
    const u = this.user();
    if (!u) return 0;
    const requiredXp = u.level * 1000;
    return (u.xp / requiredXp) * 100;
  });

  constructor() {
    this.personalInfoForm = this.fb.group({
      country: [''],
      gender: ['hombre'],
      dateOfBirth: [''],
      maritalStatus: ['soltero']
    });

    effect(() => {
      const u = this.user();
      if (u) {
        this.personalInfoForm.patchValue({
          country: u.country || '',
          gender: u.gender || 'hombre',
          dateOfBirth: u.dateOfBirth || '',
          maritalStatus: u.maritalStatus || 'soltero'
        });
      }
    });

    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    this.loadFriendData();
  }

  ngOnDestroy(): void {
    this.searchSubject.unsubscribe();
  }
  
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notification.set({ message, type });
    if (type === 'success') {
      this.soundService.playSound('notification');
    }
    setTimeout(() => this.notification.set(null), 4000);
  }

  // --- Avatar Selection ---
  async selectAvatar(avatarUrl: string): Promise<void> {
    this.notification.set(null);
    try {
      await this.authService.updateUserInfo({ avatarUrl });
      this.showAvatarSelection.set(false);
    } catch(error) {
      this.showNotification((error as Error).message, 'error');
    }
  }

  // --- Motto Selection ---
  async selectMotto(motto: MottoVerse): Promise<void> {
    this.notification.set(null);
    try {
      await this.authService.updateUserInfo({ mottoVerse: motto });
      this.showMottoSelection.set(false);
    } catch(error) {
      this.showNotification((error as Error).message, 'error');
    }
  }
  
  // --- Title Selection ---
  async selectTitle(title: string): Promise<void> {
    this.notification.set(null);
    try {
      await this.authService.updateUserInfo({ title });
      this.showTitleSelection.set(false);
    } catch(error) {
      this.showNotification((error as Error).message, 'error');
    }
  }

  // --- Personal Info Editing ---
  toggleEditProfile(): void {
    this.isEditingProfile.update(v => !v);
    if (!this.isEditingProfile()) {
      const u = this.user();
      if (u) this.personalInfoForm.reset({
        country: u.country || '',
        gender: u.gender || 'hombre',
        dateOfBirth: u.dateOfBirth || '',
        maritalStatus: u.maritalStatus || 'soltero'
      });
    }
  }

  async savePersonalInfo(): Promise<void> {
    if (this.personalInfoForm.invalid) {
      this.showNotification('Por favor, completa la información correctamente.', 'error');
      return;
    }
    this.notification.set(null);
    try {
      const updates: Partial<User> = {};
      const formValue = this.personalInfoForm.value;
      if (formValue.country) updates.country = formValue.country;
      if (formValue.gender) updates.gender = formValue.gender;
      if (formValue.dateOfBirth) updates.dateOfBirth = formValue.dateOfBirth;
      if (formValue.maritalStatus) updates.maritalStatus = formValue.maritalStatus;

      await this.authService.updateUserInfo(updates);
      this.isEditingProfile.set(false);
    } catch (error) {
      this.showNotification((error as Error).message, 'error');
    }
  }

  // --- Friend Methods ---
  async loadFriendData(): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    try {
      const friendData = await this.dataService.getFriendData(currentUser.uid);
      this.friends.set(friendData.friends);
      this.incomingRequests.set(friendData.requests);
    } catch (error) {
      console.error("Error fetching friend data:", (error as Error).message || error);
      this.showNotification('No se pudieron cargar los datos de amigos.', 'error');
    }
  }

  onSearchQueryChanged(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  async performSearch(query: string): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !query.trim()) {
      this.searchResults.set([]);
      return;
    }
    try {
      const results = await this.dataService.searchUsers(query, currentUser.uid);
      this.searchResults.set(results);
    } catch (error) {
      console.error("Error searching users:", (error as Error).message || error);
      this.showNotification('Error al buscar usuarios.', 'error');
    }
  }

  async sendFriendRequest(targetUser: User): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    try {
      await this.dataService.sendFriendRequest(currentUser.uid, targetUser.uid);
      this.authService.currentUser.update(u => {
        if (!u) return null;
        return {
          ...u,
          friendRequestsSent: [...(u.friendRequestsSent || []), targetUser.uid]
        };
      });
      this.showNotification(`Solicitud enviada a ${targetUser.customName}`, 'success');
    } catch (error) {
      console.error("Error sending friend request:", (error as Error).message || error);
      this.showNotification('No se pudo enviar la solicitud.', 'error');
    }
  }

  async acceptFriendRequest(requestingUser: User): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    try {
      await this.dataService.acceptFriendRequest(currentUser.uid, requestingUser.uid);
      this.friends.update(friends => [...friends, requestingUser]);
      this.incomingRequests.update(reqs => reqs.filter(r => r.uid !== requestingUser.uid));
      this.showNotification(`Ahora eres amigo de ${requestingUser.customName}.`, 'success');
    } catch (error) {
      console.error("Error accepting friend request:", (error as Error).message || error);
      this.showNotification('No se pudo aceptar la solicitud.', 'error');
    }
  }

  async declineFriendRequest(requestingUser: User): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    try {
      await this.dataService.declineFriendRequest(currentUser.uid, requestingUser.uid);
      this.incomingRequests.update(reqs => reqs.filter(r => r.uid !== requestingUser.uid));
      this.showNotification(`Solicitud de ${requestingUser.customName} rechazada.`, 'success');
    } catch (error) {
      console.error("Error declining friend request:", (error as Error).message || error);
      this.showNotification('No se pudo rechazar la solicitud.', 'error');
    }
  }
  
  async removeFriend(friend: User): Promise<void> {
      const currentUser = this.user();
      if (!currentUser) return;
      try {
        await this.dataService.removeFriend(currentUser.uid, friend.uid);
        this.friends.update(friends => friends.filter(f => f.uid !== friend.uid));
        this.showNotification(`${friend.customName} ha sido eliminado de tus amigos.`, 'success');
      } catch (error) {
        console.error("Error removing friend:", (error as Error).message || error);
        this.showNotification('No se pudo eliminar al amigo.', 'error');
      }
  }

  getUserStatus(targetUser: User): 'friend' | 'request_sent' | 'none' {
    if (this.friendIds().has(targetUser.uid)) return 'friend';
    if (this.sentRequestIds().has(targetUser.uid)) return 'request_sent';
    return 'none';
  }
}