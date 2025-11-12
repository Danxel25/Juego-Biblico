import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { SoundService } from '../../services/sound.service';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  currency: 'fe' | 'talents';
  type: 'consumable' | 'resource';
}

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreComponent {
  private authService = inject(AuthService);
  private soundService = inject(SoundService);
  user = this.authService.currentUser;
  
  purchaseMessage = signal<string | null>(null);

  storeItems: StoreItem[] = [
    { 
      id: 'remove_options', 
      name: 'Oración de Claridad', 
      description: 'Elimina 2 respuestas incorrectas en una pregunta.',
      icon: '🙏',
      cost: 250, 
      currency: 'fe',
      type: 'consumable',
    },
    { 
      id: 'add_time', 
      name: 'Aliento Divino', 
      description: 'Añade 15 segundos al temporizador del Desafío Rápido.',
      icon: '⏳',
      cost: 150, 
      currency: 'fe',
      type: 'consumable',
    },
    { 
      id: 'show_verse', 
      name: 'Pergamino de Profecía', 
      description: 'Revela la cita bíblica de una pregunta.',
      icon: '📜',
      cost: 400, 
      currency: 'fe',
      type: 'consumable',
    },
    { 
      id: 'talent_pack', 
      name: 'Ofrenda de Talentos', 
      description: 'Convierte tu Fe en 10 valiosos Talentos.',
      icon: '✨',
      cost: 5000, 
      currency: 'fe',
      type: 'resource',
    },
  ];
  
  canAfford(item: StoreItem): boolean {
    const currentUser = this.user();
    if (!currentUser) return false;
    return currentUser[item.currency] >= item.cost;
  }
  
  async buyItem(item: StoreItem): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !this.canAfford(item)) return;
    
    try {
      if (item.type === 'consumable') {
        await this.authService.addConsumable(item.id, item.cost, item.currency);
      } else if (item.id === 'talent_pack') {
        await this.authService.incrementUserStats({ fe: -item.cost, talents: 10 });
      }
      
      this.soundService.playSound('purchase');
      this.purchaseMessage.set(`¡Has comprado "${item.name}"!`);
      setTimeout(() => this.purchaseMessage.set(null), 3000);
    } catch(error) {
       this.purchaseMessage.set(`Error al comprar: ${(error as Error).message}`);
       setTimeout(() => this.purchaseMessage.set(null), 4000);
    }
  }
}
