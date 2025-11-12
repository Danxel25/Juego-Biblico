import { Injectable, inject, Injector } from '@angular/core';
import { supabase } from '../environments/supabase.config';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private injector = inject(Injector);
  private channel: RealtimeChannel | null = null;
  
  // Usar BehaviorSubject para compartir fácilmente el estado de presencia y obtener el valor actual.
  private presenceStateSubject = new BehaviorSubject<RealtimePresenceState>({});
  public presenceState$ = this.presenceStateSubject.asObservable();

  connect(): void {
    const authService = this.injector.get(AuthService);
    const user = authService.currentUser();
    if (!user || this.channel) {
      return;
    }

    // El nombre del canal es 'online-users'
    this.channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.uid, // Usar UID del usuario como clave de presencia
        },
      },
    });

    // Sincronizar el estado cuando nos unimos al canal por primera vez
    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel!.presenceState();
      this.presenceStateSubject.next(state);
    });

    // Actualizar cuando alguien se une
    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const state = this.channel!.presenceState();
        this.presenceStateSubject.next(state);
    });

    // Actualizar cuando alguien se va
    this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const state = this.channel!.presenceState();
        this.presenceStateSubject.next(state);
    });

    // Suscribirse al canal y rastrear al usuario
    this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.channel!.track({ online_at: new Date().toISOString() });
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.untrack();
      await this.channel.unsubscribe();
      this.channel = null;
      this.presenceStateSubject.next({});
    }
  }
}
