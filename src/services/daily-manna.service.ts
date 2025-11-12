import { Injectable, signal, inject } from '@angular/core';
import { GeminiService } from './gemini.service';
import { AuthService } from './auth.service';
import { SoundService } from './sound.service';

export interface MannaData {
  verse: string;
  reference: string;
  reflection: string;
  isLoading: boolean;
}

const MANNA_VERSES = [
  { verse: 'Todo lo puedo en Cristo que me fortalece.', reference: 'Filipenses 4:13' },
  { verse: 'Porque para Dios no hay nada imposible.', reference: 'Lucas 1:37' },
  { verse: 'Encomienda al Señor tu camino; confía en él, y él actuará.', reference: 'Salmo 37:5' },
  { verse: 'Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.', reference: '2 Timoteo 1:7' },
  { verse: 'El Señor es mi luz y mi salvación; ¿a quién temeré?', reference: 'Salmo 27:1' },
  { verse: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.', reference: 'Mateo 11:28' },
  { verse: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.', reference: 'Isaías 40:31' },
  { verse: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.', reference: 'Mateo 6:33' }
];

@Injectable({
  providedIn: 'root',
})
export class DailyMannaService {
  private geminiService = inject(GeminiService);
  private authService = inject(AuthService);
  private soundService = inject(SoundService);
  private readonly storageKey = 'lastMannaTimestamp';

  readonly showManna = signal(false);
  readonly mannaData = signal<MannaData | null>(null);

  async checkForManna(): Promise<void> {
    if (this.authService.currentUser()?.isGuest) {
        return; // Don't show for guests
    }
    
    const lastTimestamp = this.getLastMannaTimestamp();
    if (this.isNewDay(lastTimestamp)) {
      this.showManna.set(true);
      const chosenVerse = MANNA_VERSES[Math.floor(Math.random() * MANNA_VERSES.length)];
      
      this.mannaData.set({
        verse: chosenVerse.verse,
        reference: chosenVerse.reference,
        reflection: '',
        isLoading: true,
      });

      const reflection = await this.geminiService.generateDailyReflection(chosenVerse.verse, chosenVerse.reference);
      
      this.mannaData.update(data => data ? { ...data, reflection, isLoading: false } : null);
    }
  }

  markMannaAsRead(): void {
    this.showManna.set(false);
    this.mannaData.set(null);
    localStorage.setItem(this.storageKey, new Date().toISOString());
    this.soundService.playSound('notification');
    this.authService.incrementUserStats({ fe: 10 }); // Reward for reading
  }

  private getLastMannaTimestamp(): number {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? new Date(stored).getTime() : 0;
    } catch (error) {
      console.error('Error reading manna timestamp from localStorage', error);
      return 0;
    }
  }

  private isNewDay(lastTimestamp: number): boolean {
    if (lastTimestamp === 0) return true;
    const lastDate = new Date(lastTimestamp);
    const today = new Date();
    return (
      lastDate.getFullYear() !== today.getFullYear() ||
      lastDate.getMonth() !== today.getMonth() ||
      lastDate.getDate() !== today.getDate()
    );
  }
}
