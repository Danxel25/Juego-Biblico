import { Injectable, signal } from '@angular/core';
import { Announcement } from '../models/announcement.model';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private readonly _announcements = signal<Announcement[]>([
    {
      id: 'weekly-event-1',
      title: '¡Evento Semanal: El Diluvio de Preguntas!',
      content: '¡Prepárense! Este fin de semana, todas las preguntas en el Desafío Rápido estarán relacionadas con el Génesis y la historia de Noé. ¡Habrá recompensas dobles de Maná!',
      date: new Date('2024-07-28T10:00:00Z')
    },
    {
      id: 'update-v1.1',
      title: 'Actualización de la App v1.1 - ¡Duelos Bíblicos!',
      content: 'Estamos emocionados de anunciar que el modo "Duelo Bíblico" está en su fase final de pruebas y será lanzado muy pronto. ¡Gracias por su paciencia y fe!',
      date: new Date('2024-07-25T15:30:00Z')
    }
  ]);

  public readonly announcements = this._announcements.asReadonly();

  constructor() { }
}
