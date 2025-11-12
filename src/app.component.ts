import { Component, ChangeDetectionStrategy, inject, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { AuthService } from './services/auth.service';
import { BottomNavComponent } from './components/shared/bottom-nav/bottom-nav.component';
import { AchievementService } from './services/achievement.service';
import { DailyMannaComponent } from './components/daily-manna/daily-manna.component';
import { DailyMannaService } from './services/daily-manna.service';
import { SoundService } from './services/sound.service';

@Component({
  selector: 'app-root',
  template: `
@if(authLoadingState() === 'fetching_profile') {
  <div class="fixed inset-0 bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center z-[100]">
    <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600"></div>
    <h1 class="mt-8 text-2xl font-bold font-cinzel text-teal-700 dark:text-teal-400">Cargando datos...</h1>
    <p class="mt-2 text-slate-600 dark:text-slate-400">Por favor, espere.</p>
  </div>
} @else if (authLoadingState() === 'error') {
  <div class="fixed inset-0 bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center z-[100] text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    @if(authErrorMessage()?.includes('Acción Requerida')) {
      <h1 class="mt-4 text-2xl font-bold font-cinzel text-red-700 dark:text-red-400">Acción Requerida</h1>
    } @else if (authErrorMessage()?.includes('Configuración Incompleta')) {
      <h1 class="mt-4 text-2xl font-bold font-cinzel text-amber-700 dark:text-amber-400">Configuración Incompleta</h1>
    } @else {
      <h1 class="mt-4 text-2xl font-bold font-cinzel text-red-700 dark:text-red-400">Ocurrió un Error</h1>
    }
    <p class="mt-2 text-slate-600 dark:text-slate-300 max-w-md whitespace-pre-wrap">{{ authErrorMessage() || 'No se pudo cargar tu perfil.' }}</p>
    @if(authErrorMessage()?.includes('Causa Común') || authErrorMessage()?.includes('Acción Requerida') || authErrorMessage()?.includes('Configuración Incompleta')) {
      <button (click)="proceedToAuth()" class="mt-6 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-lg shadow-sm hover:bg-teal-700 transition-all active:scale-95">
        Entendido
      </button>
    }
  </div>
} @else {
  @if(isAuthenticated()){
    <app-header></app-header>
  }
  <main class="p-4 sm:p-6 pb-24 sm:pb-6">
    <router-outlet></router-outlet>
  </main>
  @if(isAuthenticated()){
    <app-bottom-nav></app-bottom-nav>
  }

  <!-- Achievement Unlocked Notification -->
  @if(newAchievement(); as ach) {
    <div class="fixed bottom-24 sm:bottom-10 right-1/2 translate-x-1/2 w-auto max-w-sm bg-gradient-to-br from-amber-400 to-orange-500 text-white px-5 py-4 rounded-lg shadow-2xl z-50 animate-achievement-in-out">
      <div class="flex items-center gap-4">
        <div class="flex-shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="ach.icon" />
           </svg>
        </div>
        <div>
          <p class="font-bold text-sm uppercase tracking-wider">¡Logro Desbloqueado!</p>
          <p class="font-semibold text-lg">{{ ach.title }}</p>
        </div>
      </div>
    </div>
    <style>
      @keyframes achievement-in-out {
        0%, 100% { opacity: 0; transform: translate(50%, 20px) scale(0.9); }
        10%, 90% { opacity: 1; transform: translate(50%, 0) scale(1); }
      }
      .animate-achievement-in-out {
        animation: achievement-in-out 5s ease-in-out forwards;
      }
    </style>
  }

  <!-- Daily Manna Modal -->
  @if(showDailyManna()) {
    <app-daily-manna></app-daily-manna>
  }
}
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, BottomNavComponent, DailyMannaComponent],
  host: {
    '(click)': 'unlockAudio()',
  },
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  achievementService = inject(AchievementService);
  dailyMannaService = inject(DailyMannaService);
  soundService = inject(SoundService);
  
  isAuthenticated = this.authService.isAuthenticated;
  authLoadingState = this.authService.authLoadingState;
  authErrorMessage = this.authService.authErrorMessage;
  newAchievement = this.achievementService.achievementUnlocked;
  showDailyManna = this.dailyMannaService.showManna;
  
  private audioUnlocked = false;

  constructor() {
    effect(() => {
      // When user is authenticated and not loading, check for Manna
      if (this.isAuthenticated() && this.authLoadingState() === 'idle') {
        this.dailyMannaService.checkForManna();
      }
    });
  }

  ngOnInit(): void {
    this.handleAuthRedirectError();
  }
  
  unlockAudio(): void {
    if (!this.audioUnlocked) {
      this.soundService.unlockAudio();
      this.audioUnlocked = true;
    }
  }

  private handleAuthRedirectError(): void {
    const hash = window.location.hash;
    if (hash.includes('error=access_denied') && hash.includes('otp_expired')) {
      const friendlyMessage = `El enlace de confirmación es inválido o ha expirado.

Causa Común: Esto suele ocurrir cuando la "Site URL" en la configuración de Autenticación de tu proyecto Supabase no coincide con la URL actual de la aplicación.

Solución:
1. Copia la URL de la barra de direcciones de tu navegador.
2. Ve a tu panel de Supabase > Authentication > URL Configuration.
3. Pega la URL en el campo "Site URL" y guarda los cambios.
4. Intenta registrarte de nuevo para recibir un nuevo enlace.`;

      this.authService.setManualError(friendlyMessage);

      // Limpia el hash para evitar que el mensaje aparezca de nuevo al recargar
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  proceedToAuth(): void {
    // Forzar una recarga limpia al estado de autenticación
    window.location.hash = '/auth';
    window.location.reload();
  }
}