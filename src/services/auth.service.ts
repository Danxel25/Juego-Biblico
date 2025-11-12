import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { supabase, supabaseUrl, supabaseKey } from '../environments/supabase.config';
import { User } from '../models/user.model';
import { DataService } from './data.service';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PresenceService } from './presence.service';

function formatSupabaseError(error: any): string {
  if (!error) return 'Ocurrió un error inesperado.';

  const message = error.message || '';
  const code = error.code || '';

  if (code === '42P01' || (message.includes('relation') && message.includes('does not exist'))) {
    return `¡Acción Requerida! Base de Datos no Configurada.

La tabla 'public.users' no se encontró. Esto es normal en la primera ejecución.

**Sigue estos pasos EXACTAMENTE para solucionarlo:**

1.  En el explorador de archivos a la izquierda, busca y abre el archivo:
    \`src/supabase_setup.txt\`
2.  Copia **TODO** el contenido de ese archivo.
3.  Ve a tu proyecto en Supabase y busca el **"SQL Editor"** en el menú.
4.  Pega el script que copiaste y haz clic en **"RUN"**.

Este archivo contiene solo código SQL, por lo que no deberías tener problemas de sintaxis.`;
  }

  if (code === '42703' || (message.includes('column') && message.includes('does not exist'))) {
    const match = message.match(/column "(\w+)" of relation/);
    const column = match ? match[1] : 'desconocida';
    return `¡Error de Base de Datos! La columna '${column}' no se encuentra en la tabla. Esto usualmente significa que la estructura de la base de datos está desactualizada. Por favor, intenta ejecutar de nuevo el script de configuración desde 'src/supabase_setup.txt'.`;
  }
  
  if (code === '23502' || message.includes('violates not-null constraint')) {
     const match = message.match(/null value in column "(\w+)"/);
     const column = match ? match[1] : 'desconocida';
     return `Error al guardar: El campo '${column}' es obligatorio y no puede estar vacío.`;
  }

  return message.includes('Failed to fetch') 
      ? 'No se pudo conectar con la base de datos. Revisa tu conexión a internet.'
      : 'Ocurrió un error en la base de datos. Por favor, inténtalo de nuevo.';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private dataService = inject(DataService);
  private presenceService = inject(PresenceService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly authLoadingState = signal<'idle' | 'fetching_profile' | 'error'>('idle');
  readonly authErrorMessage = signal<string | null>(null);
  private authInitialized = signal(false);

  constructor() {
    if (supabaseKey.startsWith('YOUR_SUPABASE_ANON_KEY') || supabaseUrl.startsWith('YOUR_SUPABASE_URL')) {
        const configErrorMessage = `¡Configuración Incompleta! Conecta la App a tu Base de Datos.

Has preparado la base de datos correctamente (¡el script SQL funcionó!), pero la aplicación todavía no sabe cómo conectarse a ella.

**Sigue estos pasos FINALES:**

1.  Ve a tu proyecto en Supabase.
2.  En el menú, ve a **Project Settings** (rueda dentada) > **API**.
3.  Encontrarás tu **Project URL** y tu **Project API Key** (la que dice \`anon\` y \`public\`).

4.  Ahora, en el explorador de archivos a la izquierda, busca y abre este archivo:
    \`src/environments/supabase.config.ts\`

5.  Dentro de ese archivo, reemplaza las dos líneas que dicen:
    \`'YOUR_SUPABASE_URL'\`
    \`'YOUR_SUPABASE_ANON_KEY'\`
    ...con la URL y la Clave que copiaste de tu panel de Supabase.

¡Guarda el archivo y la aplicación se conectará automáticamente!`;
        this.setManualError(configErrorMessage);
        this.authInitialized.set(true); // Previene bucles de redirección
        return;
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (this.authLoadingState() === 'error') return;

      if (session?.user) {
        // If the user's session is already active and loaded in the component state,
        // skip re-fetching to avoid a disruptive loading screen on reloads or background events.
        if (this.currentUser()?.uid === session.user.id) {
          if (!this.authInitialized()) {
            this.authInitialized.set(true);
          }
          return; // Skip re-fetch
        }

        this.authLoadingState.set('fetching_profile');
        await this.fetchUserProfile(session.user);
      } else {
        // Only update state if there was a user before (i.e., this is a real sign-out event)
        if (this.currentUser() !== null) {
          this.currentUser.set(null);
          this.presenceService.disconnect();
          this.authLoadingState.set('idle');
        }
      }
      // Ensure the app is marked as initialized so routing logic can proceed.
      this.authInitialized.set(true);
    });

    effect(() => {
      if (!this.authInitialized()) return;

      const user = this.currentUser();
      const loadingState = this.authLoadingState();
      const currentPath = this.router.url;

      untracked(() => {
        if (user && currentPath.includes('/auth')) {
          this.router.navigate(['/main-menu']);
        } else if (!user && loadingState === 'idle' && !currentPath.includes('/auth')) {
          this.router.navigate(['/auth']);
        }
      });
    });
  }

  private async fetchUserProfile(supabaseUser: SupabaseUser) {
    // First, update login streak. This is a fire-and-forget operation.
    try {
      await this.dataService.updateLoginStreak(supabaseUser.id);
    } catch (streakError) {
      console.warn("Could not update login streak:", streakError);
    }
  
    let attempts = 0;
    const maxAttempts = 3; // Retry a few times for replication delay
    const delay = 1000;

    while (attempts < maxAttempts) {
      try {
        const userProfile = await this.dataService.getUser(supabaseUser.id);
        if (userProfile) {
          if (!userProfile.mottoVerse) {
            userProfile.mottoVerse = {
              text: 'El Señor es mi pastor, nada me faltará.',
              reference: 'Salmo 23:1',
            };
          }
          this.currentUser.set(userProfile);
          this.presenceService.connect();
          this.authLoadingState.set('idle');
          this.authErrorMessage.set(null);
          return; // Success!
        }
        // Profile not found, wait and retry
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay * attempts));
      } catch (error) {
        // This catches actual DB errors, not just "not found"
        console.error(`Attempt ${attempts + 1} failed with DB error`, error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay * attempts));
      }
    }

    // If we're here, retries failed. Let's try to self-repair.
    console.warn('User profile not found after retries. Attempting self-repair...');
    try {
      await this.dataService.ensureUserProfileExists(supabaseUser.id);
      
      // Try one last time to fetch the profile after repair.
      const finalProfile = await this.dataService.getUser(supabaseUser.id);
      if (finalProfile) {
        console.log('Self-repair successful. User profile created and fetched.');
        if (!finalProfile.mottoVerse) {
          finalProfile.mottoVerse = {
            text: 'El Señor es mi pastor, nada me faltará.',
            reference: 'Salmo 23:1',
          };
        }
        this.currentUser.set(finalProfile);
        this.presenceService.connect();
        this.authLoadingState.set('idle');
        this.authErrorMessage.set(null);
        return;
      }
      
      // If it still doesn't exist, something is seriously wrong.
      throw new Error('Profile still not found after self-repair attempt.');

    } catch (error: any) {
      console.error('Failed to fetch user profile.', error.message || error);
      this.authErrorMessage.set(formatSupabaseError(error));
      this.authLoadingState.set('error');
    }
  }

  setManualError(message: string): void {
    this.authErrorMessage.set(message);
    this.authLoadingState.set('error');
  }

  async login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async register(
    email: string,
    password: string,
    customName: string
  ): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          customName,
        },
      },
    });
    if (error) throw error;
  }
  
  async guestLogin(): Promise<void> {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }

  async updateUserInfo(updatedInfo: Partial<User>): Promise<void> {
    const user = this.currentUser();
    if (user) {
      try {
        await this.dataService.updateUser(user.uid, updatedInfo);
        this.currentUser.update(currentUser => currentUser ? { ...currentUser, ...updatedInfo } : null);
      } catch (error) {
        console.error('Failed to update user info:', error);
        throw new Error(formatSupabaseError(error));
      }
    }
  }
  
  async incrementUserStats(stats: { xp?: number; fe?: number; talents?: number; duels_won?: number; correct_answers?: number }): Promise<void> {
    const user = this.currentUser();
    if (!user) return;
    
    await this.dataService.incrementUserStats(user.uid, stats);

    // Update local signal for instant feedback, including leveling logic
    this.currentUser.update(currentUser => {
        if (!currentUser) return null;
        
        let newXp = (currentUser.xp || 0) + (stats.xp || 0);
        let newLevel = currentUser.level;
        let requiredXp = newLevel * 1000;

        while (newXp >= requiredXp) {
            newXp -= requiredXp;
            newLevel++;
            requiredXp = newLevel * 1000;
        }

        return {
            ...currentUser,
            level: newLevel,
            xp: newXp,
            fe: (currentUser.fe || 0) + (stats.fe || 0),
            talents: (currentUser.talents || 0) + (stats.talents || 0),
            duelsWon: (currentUser.duelsWon || 0) + (stats.duels_won || 0),
            correctAnswers: (currentUser.correctAnswers || 0) + (stats.correct_answers || 0)
        };
    });
  }

  async addConsumable(itemId: string, cost: number, currency: 'fe' | 'talents'): Promise<void> {
    const user = this.currentUser();
    if (!user) return;

    await this.dataService.purchaseConsumable(user.uid, itemId, cost, currency);
    
    this.currentUser.update(u => {
        if (!u) return null;
        const newConsumables = { ...(u.consumables || {}) };
        newConsumables[itemId] = (newConsumables[itemId] || 0) + 1;
        return { 
            ...u, 
            [currency]: u[currency] - cost,
            consumables: newConsumables 
        };
    });
  }

  async useConsumable(itemId: string): Promise<void> {
    const user = this.currentUser();
    if (!user || !(user.consumables?.[itemId] ?? 0 > 0)) return;

    await this.dataService.useConsumable(user.uid, itemId);

    this.currentUser.update(u => {
      if (!u) return null;
      const newConsumables = { ...(u.consumables || {}) };
      newConsumables[itemId] = Math.max(0, (newConsumables[itemId] || 0) - 1);
      return { ...u, consumables: newConsumables };
    });
  }

  async unlockAchievement(achievementId: string): Promise<void> {
    const user = this.currentUser();
    if (!user || (user.unlockedAchievements || []).includes(achievementId)) return;

    const updatedAchievements = [...(user.unlockedAchievements || []), achievementId];
    try {
      await this.dataService.updateUser(user.uid, { unlockedAchievements: updatedAchievements });
      this.currentUser.update(u => u ? { ...u, unlockedAchievements: updatedAchievements } : null);
    } catch (error) {
      console.error(`Failed to unlock achievement ${achievementId}:`, error);
      throw new Error(formatSupabaseError(error));
    }
  }

  async logout(): Promise<void> {
    await this.presenceService.disconnect();
    await supabase.auth.signOut();
    this.authErrorMessage.set(null);
  }
}