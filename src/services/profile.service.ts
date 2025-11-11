import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Avatar, MottoVerse, Title } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;

  private readonly _avatars = signal<Avatar[]>([
    { id: 'david', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=david' },
    { id: 'maria', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=maria' },
    { id: 'pedro', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=pedro' },
    { id: 'ester', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=ester' },
    { id: 'josue', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=josue' },
    { id: 'rut', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=rut' },
    { id: 'pablo', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=pablo' },
    { id: 'moises', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=moises' },
  ]);

  private readonly _mottoVerses = signal<MottoVerse[]>([
    { text: 'El Señor es mi pastor, nada me faltará.', reference: 'Salmo 23:1' },
    { text: 'Porque para Dios no hay nada imposible.', reference: 'Lucas 1:37' },
    { text: 'Todo lo puedo en Cristo que me fortalece.', reference: 'Filipenses 4:13' },
    { text: 'El amor es paciente, es bondadoso.', reference: '1 Corintios 13:4' },
    { text: 'Encomienda al Señor tu camino; confía en él, y él actuará.', reference: 'Salmo 37:5' },
    { text: 'Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.', reference: '2 Timoteo 1:7' },
  ]);

  private readonly _titles = signal<Title[]>([
    { name: 'Neófito de la Fe', unlockLevel: 1 },
    { name: 'Estudiante de la Palabra', unlockLevel: 5 },
    { name: 'Estudioso de los Salmos', unlockLevel: 10 },
    { name: 'Discípulo Devoto', unlockLevel: 15 },
    { name: 'Maestro Erudito', unlockLevel: 20 },
    { name: 'Anciano de la Fe', unlockLevel: 30 },
  ]);
  
  public readonly avatars = this._avatars.asReadonly();
  public readonly mottoVerses = this._mottoVerses.asReadonly();
  public readonly allTitles = this._titles.asReadonly();
  
  public readonly unlockedTitles = computed(() => {
    const userLevel = this.currentUser()?.level ?? 0;
    return this.allTitles().filter(title => userLevel >= title.unlockLevel);
  });
}