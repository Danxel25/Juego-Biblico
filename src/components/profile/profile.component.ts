import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AchievementService } from '../../services/achievement.service';
import { ProfileService } from '../../services/profile.service';
import { MottoVerse } from '../../models/profile.model';
import { User } from '../../models/user.model';
import { Achievement } from '../../models/achievement.model';

interface DisplayAchievement extends Achievement {
  unlocked: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private achievementService = inject(AchievementService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  user = this.authService.currentUser;
  
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

  // Modal visibility state
  showAvatarSelection = signal(false);
  showMottoSelection = signal(false);
  showTitleSelection = signal(false);
  errorMessage = signal<string | null>(null);
  
  // Personal Info editing
  isEditingProfile = signal(false);
  personalInfoForm: FormGroup;
  countries = ["Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", "España", "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico", "República Dominicana", "Uruguay", "Venezuela", "Otro"];

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
  }

  // --- Avatar Selection ---
  async selectAvatar(avatarUrl: string): Promise<void> {
    this.errorMessage.set(null);
    try {
      await this.authService.updateUserInfo({ avatarUrl });
      this.showAvatarSelection.set(false);
    } catch(error) {
      this.errorMessage.set((error as Error).message);
    }
  }

  // --- Motto Selection ---
  async selectMotto(motto: MottoVerse): Promise<void> {
    this.errorMessage.set(null);
    try {
      await this.authService.updateUserInfo({ mottoVerse: motto });
      this.showMottoSelection.set(false);
    } catch(error) {
      this.errorMessage.set((error as Error).message);
    }
  }
  
  // --- Title Selection ---
  async selectTitle(title: string): Promise<void> {
    this.errorMessage.set(null);
    try {
      await this.authService.updateUserInfo({ title });
      this.showTitleSelection.set(false);
    } catch(error) {
      this.errorMessage.set((error as Error).message);
    }
  }

  // --- Personal Info Editing ---
  toggleEditProfile(): void {
    this.isEditingProfile.update(v => !v);
    if (!this.isEditingProfile()) {
      // If cancelling, reset form to current user state
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
      this.errorMessage.set('Por favor, completa la información correctamente.');
      return;
    }
    this.errorMessage.set(null);
    try {
      // Filter out empty string values to not overwrite with them
      const updates: Partial<User> = {};
      const formValue = this.personalInfoForm.value;
      if (formValue.country) updates.country = formValue.country;
      if (formValue.gender) updates.gender = formValue.gender;
      if (formValue.dateOfBirth) updates.dateOfBirth = formValue.dateOfBirth;
      if (formValue.maritalStatus) updates.maritalStatus = formValue.maritalStatus;

      await this.authService.updateUserInfo(updates);
      this.isEditingProfile.set(false);
    } catch (error) {
      this.errorMessage.set((error as Error).message);
    }
  }
}