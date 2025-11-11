import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { AuthService } from './services/auth.service';
import { BottomNavComponent } from './components/shared/bottom-nav/bottom-nav.component';
import { AchievementService } from './services/achievement.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, BottomNavComponent],
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  achievementService = inject(AchievementService);
  
  isAuthenticated = this.authService.isAuthenticated;
  authLoadingState = this.authService.authLoadingState;
  authErrorMessage = this.authService.authErrorMessage;
  newAchievement = this.achievementService.achievementUnlocked;

  ngOnInit(): void {
    this.handleAuthRedirectError();
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