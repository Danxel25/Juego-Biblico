import { Injectable, signal } from '@angular/core';
import { Announcement } from '../models/announcement.model';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private readonly _announcements = signal<Announcement[]>([
    {
      id: 'update-v1.2',
      title: '¡Novedades de la Versión! Mejoras y Correcciones',
      content: `Hemos estado trabajando para mejorar tu experiencia en Cruzada Celestial. ¡Estas son las últimas novedades!\n\n• Perfil de Amigos Unificado: Toda la gestión de amigos (búsqueda, solicitudes, lista) ahora está centralizada en tu página de Perfil para una experiencia social más fluida.\n• Modo Oscuro Instantáneo: Añadimos un práctico icono de sol/luna en la barra de navegación para que puedas cambiar de tema al instante.\n• Recompensas Justas: Corregimos la lógica del 'Maná Diario' para que solo se pueda reclamar una vez al día y ajustamos el evento semanal para que se reinicie correctamente cada domingo.`,
      date: new Date()
    }
  ]);

  public readonly announcements = this._announcements.asReadonly();

  constructor() { }
}