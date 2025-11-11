import { Injectable } from '@angular/core';
import { Question } from '../models/question.model';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private questions: Question[] = [
    // General
    { id: 1, text: '¿Quién fue el primer rey de Israel?', options: ['David', 'Saúl', 'Salomón', 'Samuel'], correctAnswer: 'Saúl', verse: '1 Samuel 10:24', category: 'Antiguo Testamento' },
    { id: 2, text: '¿Cuál es el primer libro del Nuevo Testamento?', options: ['Génesis', 'Apocalipsis', 'Hechos', 'Mateo'], correctAnswer: 'Mateo', verse: 'N/A', category: 'General' },
    { id: 3, text: '¿Cuántos discípulos tenía Jesús?', options: ['10', '11', '12', '13'], correctAnswer: '12', verse: 'Mateo 10:1', category: 'Evangelios' },

    // Génesis - Creación
    { id: 101, text: '¿En qué día creó Dios los grandes monstruos marinos y las aves?', options: ['Tercer día', 'Cuarto día', 'Quinto día', 'Sexto día'], correctAnswer: 'Quinto día', verse: 'Génesis 1:21', category: 'Génesis - Creación' },
    { id: 102, text: '¿Qué creó Dios en el primer día?', options: ['El cielo y la tierra', 'La luz', 'Los mares', 'El sol y la luna'], correctAnswer: 'La luz', verse: 'Génesis 1:3', category: 'Génesis - Creación' },
    { id: 103, text: '¿Qué dijo Dios que era "bueno en gran manera"?', options: ['La luz', 'La tierra seca', 'Los animales', 'Toda su creación'], correctAnswer: 'Toda su creación', verse: 'Génesis 1:31', category: 'Génesis - Creación' },

    // Génesis - Edén
    { id: 104, text: '¿De qué árbol se les prohibió a Adán y Eva comer?', options: ['El árbol de la vida', 'La higuera', 'El árbol de la ciencia del bien y del mal', 'El olivo'], correctAnswer: 'El árbol de la ciencia del bien y del mal', verse: 'Génesis 2:17', category: 'Génesis - Edén' },
    { id: 105, text: '¿Quién tentó a Eva para que comiera del fruto prohibido?', options: ['Un ángel', 'La serpiente', 'Adán', 'Un querubín'], correctAnswer: 'La serpiente', verse: 'Génesis 3:1', category: 'Génesis - Edén' },
    { id: 106, text: '¿Cómo fue creada Eva?', options: ['Del polvo de la tierra', 'De una costilla de Adán', 'Por la palabra de Dios', 'No se especifica'], correctAnswer: 'De una costilla de Adán', verse: 'Génesis 2:22', category: 'Génesis - Edén' },

    // Génesis - Caín y Abel
    { id: 107, text: '¿Qué ofrenda trajo Caín al Señor?', options: ['Las primicias de su rebaño', 'Una paloma', 'Frutos de la tierra', 'Incienso'], correctAnswer: 'Frutos de la tierra', verse: 'Génesis 4:3', category: 'Génesis - Caín y Abel' },
    { id: 108, text: '¿Por qué mató Caín a Abel?', options: ['Por una disputa de tierras', 'Por celos de que Dios aceptara la ofrenda de Abel', 'Por accidente', 'Por orden de un ángel'], correctAnswer: 'Por celos de que Dios aceptara la ofrenda de Abel', verse: 'Génesis 4:5-8', category: 'Génesis - Caín y Abel' },
    { id: 109, text: '¿Cuál fue el castigo de Caín por matar a su hermano?', options: ['Muerte inmediata', 'Ser esclavo', 'Ser errante y extranjero en la tierra', 'Perder todas sus posesiones'], correctAnswer: 'Ser errante y extranjero en la tierra', verse: 'Génesis 4:12', category: 'Génesis - Caín y Abel' },

    // Éxodo - Plagas
    { id: 201, text: '¿Cuál fue la primera plaga que Dios envió a Egipto?', options: ['Ranas', 'Piojos', 'El agua convertida en sangre', 'Oscuridad'], correctAnswer: 'El agua convertida en sangre', verse: 'Éxodo 7:20', category: 'Éxodo - Plagas' },
    { id: 202, text: '¿Cuántas plagas en total fueron enviadas sobre Egipto?', options: ['7', '10', '12', '3'], correctAnswer: '10', verse: 'Éxodo 7-12', category: 'Éxodo - Plagas' },
    { id: 203, text: '¿Qué plaga finalmente convenció al Faraón de dejar ir a los israelitas?', options: ['Langostas', 'Granizo', 'La muerte de los primogénitos', 'Úlceras'], correctAnswer: 'La muerte de los primogénitos', verse: 'Éxodo 12:29-31', category: 'Éxodo - Plagas' },

    // Éxodo - Mar Rojo
    { id: 204, text: '¿Cómo guió Dios a los israelitas en el desierto durante el día?', options: ['Con una estrella', 'Con una columna de nube', 'Con un mapa', 'Con un ángel'], correctAnswer: 'Con una columna de nube', verse: 'Éxodo 13:21', category: 'Éxodo - Mar Rojo' },
    { id: 205, text: '¿Qué hizo Moisés para dividir el Mar Rojo?', options: ['Oró en silencio', 'Construyó un puente', 'Extendió su vara sobre el mar', 'Tocó una trompeta'], correctAnswer: 'Extendió su vara sobre el mar', verse: 'Éxodo 14:21', category: 'Éxodo - Mar Rojo' },
    { id: 206, text: '¿Qué les sucedió a los ejércitos del Faraón que persiguieron a los israelitas?', options: ['Se perdieron en el desierto', 'Se rindieron', 'Fueron ahogados por el mar', 'Regresaron a Egipto'], correctAnswer: 'Fueron ahogados por el mar', verse: 'Éxodo 14:28', category: 'Éxodo - Mar Rojo' },

    // Éxodo - Mandamientos
    { id: 207, text: '¿En qué montaña recibió Moisés los Diez Mandamientos?', options: ['Monte de los Olivos', 'Monte Carmelo', 'Monte Sinaí', 'Monte Ararat'], correctAnswer: 'Monte Sinaí', verse: 'Éxodo 19:20', category: 'Éxodo - Mandamientos' },
    { id: 208, text: '¿Qué estaban haciendo los israelitas mientras Moisés estaba en la montaña?', options: ['Orando y ayunando', 'Construyendo el Tabernáculo', 'Adorando un becerro de oro', 'Esperando pacientemente'], correctAnswer: 'Adorando un becerro de oro', verse: 'Éxodo 32:4', category: 'Éxodo - Mandamientos' },
    { id: 209, text: '¿Qué hizo Moisés con las primeras tablas de la ley cuando vio la idolatría del pueblo?', options: ['Las guardó en el Arca', 'Las rompió al pie del monte', 'Las leyó en voz alta', 'Las escondió en una cueva'], correctAnswer: 'Las rompió al pie del monte', verse: 'Éxodo 32:19', category: 'Éxodo - Mandamientos' },

    // Reyes - David
    { id: 301, text: '¿Quién era el gigante filisteo que David derrotó?', options: ['Og', 'Sihón', 'Goliat', 'Anac'], correctAnswer: 'Goliat', verse: '1 Samuel 17:4', category: 'Reyes - David' },
    { id: 302, text: '¿Cuál era el instrumento musical que David tocaba para el rey Saúl?', options: ['Flauta', 'Lira', 'Arpa', 'Tambor'], correctAnswer: 'Arpa', verse: '1 Samuel 16:23', category: 'Reyes - David' },
    { id: 303, text: '¿Qué ciudad estableció David como la capital de Israel?', options: ['Hebrón', 'Jericó', 'Samaria', 'Jerusalén'], correctAnswer: 'Jerusalén', verse: '2 Samuel 5:6-7', category: 'Reyes - David' },
  ];

  constructor() {}

  getQuestions(count: number): Observable<Question[]> {
    const shuffled = [...this.questions].sort(() => 0.5 - Math.random());
    return of(shuffled.slice(0, count));
  }

  getQuestionsByCategory(category: string, count: number): Observable<Question[]> {
    const filtered = this.questions.filter(q => q.category === category);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return of(shuffled.slice(0, count));
  }
}
