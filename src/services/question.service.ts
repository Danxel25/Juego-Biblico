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
    { id: 4, text: '¿Qué significa la palabra "Evangelio"?', options: ['Buena Noticia', 'La Ley', 'El Pacto', 'La Historia'], correctAnswer: 'Buena Noticia', verse: 'Marcos 1:1', category: 'General' },
    { id: 5, text: '¿En qué idioma se escribió principalmente el Nuevo Testamento?', options: ['Hebreo', 'Latín', 'Arameo', 'Griego'], correctAnswer: 'Griego', verse: 'N/A', category: 'General' },
    { id: 6, text: '¿Cuál es el libro más corto del Antiguo Testamento?', options: ['Rut', 'Abdías', 'Ageo', 'Nahúm'], correctAnswer: 'Abdías', verse: 'Abdías 1', category: 'Antiguo Testamento' },
    { id: 7, text: '¿Cuál es el libro más largo de la Biblia?', options: ['Génesis', 'Isaías', 'Salmos', 'Jeremías'], correctAnswer: 'Salmos', verse: 'N/A', category: 'General' },

    // Génesis
    { id: 101, text: '¿En qué día creó Dios los grandes monstruos marinos y las aves?', options: ['Tercer día', 'Cuarto día', 'Quinto día', 'Sexto día'], correctAnswer: 'Quinto día', verse: 'Génesis 1:21', category: 'Génesis - Creación' },
    { id: 102, text: '¿Qué creó Dios en el primer día?', options: ['El cielo y la tierra', 'La luz', 'Los mares', 'El sol y la luna'], correctAnswer: 'La luz', verse: 'Génesis 1:3', category: 'Génesis - Creación' },
    { id: 103, text: '¿Qué dijo Dios que era "bueno en gran manera"?', options: ['La luz', 'La tierra seca', 'Los animales', 'Toda su creación'], correctAnswer: 'Toda su creación', verse: 'Génesis 1:31', category: 'Génesis - Creación' },
    { id: 104, text: '¿De qué árbol se les prohibió a Adán y Eva comer?', options: ['El árbol de la vida', 'La higuera', 'El árbol de la ciencia del bien y del mal', 'El olivo'], correctAnswer: 'El árbol de la ciencia del bien y del mal', verse: 'Génesis 2:17', category: 'Génesis - Edén' },
    { id: 105, text: '¿Quién tentó a Eva para que comiera del fruto prohibido?', options: ['Un ángel', 'La serpiente', 'Adán', 'Un querubín'], correctAnswer: 'La serpiente', verse: 'Génesis 3:1', category: 'Génesis - Edén' },
    { id: 106, text: '¿Cómo fue creada Eva?', options: ['Del polvo de la tierra', 'De una costilla de Adán', 'Por la palabra de Dios', 'No se especifica'], correctAnswer: 'De una costilla de Adán', verse: 'Génesis 2:22', category: 'Génesis - Edén' },
    { id: 107, text: '¿Qué ofrenda trajo Caín al Señor?', options: ['Las primicias de su rebaño', 'Una paloma', 'Frutos de la tierra', 'Incienso'], correctAnswer: 'Frutos de la tierra', verse: 'Génesis 4:3', category: 'Génesis - Caín y Abel' },
    { id: 108, text: '¿Por qué mató Caín a Abel?', options: ['Por una disputa de tierras', 'Por celos de que Dios aceptara la ofrenda de Abel', 'Por accidente', 'Por orden de un ángel'], correctAnswer: 'Por celos de que Dios aceptara la ofrenda de Abel', verse: 'Génesis 4:5-8', category: 'Génesis - Caín y Abel' },
    { id: 109, text: '¿Cuál fue el castigo de Caín por matar a su hermano?', options: ['Muerte inmediata', 'Ser esclavo', 'Ser errante y extranjero en la tierra', 'Perder todas sus posesiones'], correctAnswer: 'Ser errante y extranjero en la tierra', verse: 'Génesis 4:12', category: 'Génesis - Caín y Abel' },
    { id: 110, text: '¿Quién fue el hombre que vivió más años según la Biblia?', options: ['Adán', 'Noé', 'Enoc', 'Matusalén'], correctAnswer: 'Matusalén', verse: 'Génesis 5:27', category: 'Génesis' },
    { id: 111, text: '¿Cómo se llamaba la esposa de Abraham?', options: ['Rebeca', 'Sarai', 'Agar', 'Lea'], correctAnswer: 'Sarai', verse: 'Génesis 11:29', category: 'Génesis' },

    // Éxodo
    { id: 201, text: '¿Cuál fue la primera plaga que Dios envió a Egipto?', options: ['Ranas', 'Piojos', 'El agua convertida en sangre', 'Oscuridad'], correctAnswer: 'El agua convertida en sangre', verse: 'Éxodo 7:20', category: 'Éxodo - Plagas' },
    { id: 202, text: '¿Cuántas plagas en total fueron enviadas sobre Egipto?', options: ['7', '10', '12', '3'], correctAnswer: '10', verse: 'Éxodo 7-12', category: 'Éxodo - Plagas' },
    { id: 203, text: '¿Qué plaga finalmente convenció al Faraón de dejar ir a los israelitas?', options: ['Langostas', 'Granizo', 'La muerte de los primogénitos', 'Úlceras'], correctAnswer: 'La muerte de los primogénitos', verse: 'Éxodo 12:29-31', category: 'Éxodo - Plagas' },
    { id: 204, text: '¿Cómo guió Dios a los israelitas en el desierto durante el día?', options: ['Con una estrella', 'Con una columna de nube', 'Con un mapa', 'Con un ángel'], correctAnswer: 'Con una columna de nube', verse: 'Éxodo 13:21', category: 'Éxodo - Mar Rojo' },
    { id: 205, text: '¿Qué hizo Moisés para dividir el Mar Rojo?', options: ['Oró en silencio', 'Construyó un puente', 'Extendió su vara sobre el mar', 'Tocó una trompeta'], correctAnswer: 'Extendió su vara sobre el mar', verse: 'Éxodo 14:21', category: 'Éxodo - Mar Rojo' },
    { id: 206, text: '¿Qué les sucedió a los ejércitos del Faraón que persiguieron a los israelitas?', options: ['Se perdieron en el desierto', 'Se rindieron', 'Fueron ahogados por el mar', 'Regresaron a Egipto'], correctAnswer: 'Fueron ahogados por el mar', verse: 'Éxodo 14:28', category: 'Éxodo - Mar Rojo' },
    { id: 207, text: '¿En qué montaña recibió Moisés los Diez Mandamientos?', options: ['Monte de los Olivos', 'Monte Carmelo', 'Monte Sinaí', 'Monte Ararat'], correctAnswer: 'Monte Sinaí', verse: 'Éxodo 19:20', category: 'Éxodo - Mandamientos' },
    { id: 208, text: '¿Qué estaban haciendo los israelitas mientras Moisés estaba en la montaña?', options: ['Orando y ayunando', 'Construyendo el Tabernáculo', 'Adorando un becerro de oro', 'Esperando pacientemente'], correctAnswer: 'Adorando un becerro de oro', verse: 'Éxodo 32:4', category: 'Éxodo - Mandamientos' },
    { id: 209, text: '¿Qué hizo Moisés con las primeras tablas de la ley cuando vio la idolatría del pueblo?', options: ['Las guardó en el Arca', 'Las rompió al pie del monte', 'Las leyó en voz alta', 'Las escondió en una cueva'], correctAnswer: 'Las rompió al pie del monte', verse: 'Éxodo 32:19', category: 'Éxodo - Mandamientos' },

    // Reyes
    { id: 301, text: '¿Quién era el gigante filisteo que David derrotó?', options: ['Og', 'Sihón', 'Goliat', 'Anac'], correctAnswer: 'Goliat', verse: '1 Samuel 17:4', category: 'Reyes - David' },
    { id: 302, text: '¿Cuál era el instrumento musical que David tocaba para el rey Saúl?', options: ['Flauta', 'Lira', 'Arpa', 'Tambor'], correctAnswer: 'Arpa', verse: '1 Samuel 16:23', category: 'Reyes - David' },
    { id: 303, text: '¿Qué ciudad estableció David como la capital de Israel?', options: ['Hebrón', 'Jericó', 'Samaria', 'Jerusalén'], correctAnswer: 'Jerusalén', verse: '2 Samuel 5:6-7', category: 'Reyes - David' },
    { id: 304, text: '¿Quién fue el mejor amigo de David e hijo del rey Saúl?', options: ['Abner', 'Joab', 'Jonatán', 'Is-boset'], correctAnswer: 'Jonatán', verse: '1 Samuel 18:1', category: 'Reyes - David' },
    { id: 305, text: '¿Con qué mujer cometió adulterio David?', options: ['Abigail', 'Mical', 'Betsabé', 'Ahinoam'], correctAnswer: 'Betsabé', verse: '2 Samuel 11:4', category: 'Reyes - David' },
    { id: 306, text: '¿Qué profeta confrontó a David por su pecado con Betsabé?', options: ['Elías', 'Natán', 'Samuel', 'Gad'], correctAnswer: 'Natán', verse: '2 Samuel 12:1', category: 'Reyes - David' },
    { id: 307, text: '¿Cuál de los hijos de David se rebeló contra él e intentó tomar el trono?', options: ['Salomón', 'Absalón', 'Amnón', 'Adonías'], correctAnswer: 'Absalón', verse: '2 Samuel 15', category: 'Reyes - David' },
    { id: 308, text: '¿Qué material acumuló David en abundancia para la construcción del Templo que edificaría su hijo?', options: ['Madera de cedro', 'Lino fino', 'Piedras preciosas', 'Oro, plata y bronce'], correctAnswer: 'Oro, plata y bronce', verse: '1 Crónicas 22:14', category: 'Reyes - David' },
    { id: 309, text: '¿A qué ciudad huyó David cuando Absalón se apoderó de Jerusalén?', options: ['Hebrón', 'Gat', 'Mahanaim', 'Jericó'], correctAnswer: 'Mahanaim', verse: '2 Samuel 17:24', category: 'Reyes - David' },
    { id: 310, text: '¿Qué salmo famoso escribió David expresando su arrepentimiento después de su pecado con Betsabé?', options: ['Salmo 23', 'Salmo 91', 'Salmo 1', 'Salmo 51'], correctAnswer: 'Salmo 51', verse: 'Salmo 51 (título)', category: 'Reyes - David' },
    { id: 311, text: '¿Qué rey construyó el primer Templo en Jerusalén?', options: ['David', 'Saúl', 'Salomón', 'Josías'], correctAnswer: 'Salomón', verse: '1 Reyes 6:1', category: 'Reyes - Salomón' },
    { id: 312, text: '¿Por qué es famoso el rey Salomón?', options: ['Por su fuerza', 'Por su sabiduría', 'Por ser un gran guerrero', 'Por su longevidad'], correctAnswer: 'Por su sabiduría', verse: '1 Reyes 4:29-30', category: 'Reyes - Salomón' },
    
    // Evangelios - Parábolas
    { id: 401, text: 'En la parábola del sembrador, ¿qué representa la semilla que cae en buena tierra?', options: ['Los que oyen la palabra y la entienden', 'Los problemas del mundo', 'La palabra de Dios', 'Los que se apartan de la fe'], correctAnswer: 'Los que oyen la palabra y la entienden', verse: 'Mateo 13:23', category: 'Evangelios - Parábolas' },
    { id: 402, text: '¿Qué le pide el hijo pródigo a su padre al regresar a casa?', options: ['Su herencia', 'Ser tratado como un siervo', 'Ser el jefe de la casa', 'Dinero para un nuevo viaje'], correctAnswer: 'Ser tratado como un siervo', verse: 'Lucas 15:19', category: 'Evangelios - Parábolas' },
    { id: 403, text: 'En la parábola de los talentos, ¿qué hizo el siervo que recibió un solo talento?', options: ['Lo invirtió y lo duplicó', 'Lo regaló a los pobres', 'Lo escondió en la tierra', 'Lo perdió en el mercado'], correctAnswer: 'Lo escondió en la tierra', verse: 'Mateo 25:25', category: 'Evangelios - Parábolas' },
    { id: 404, text: '¿Quién ayudó al hombre herido en el camino en la parábola del Buen Samaritano?', options: ['Un sacerdote', 'Un levita', 'Un samaritano', 'Un soldado romano'], correctAnswer: 'Un samaritano', verse: 'Lucas 10:33-34', category: 'Evangelios - Parábolas' },
    { id: 405, text: '¿Qué objeto perdió la mujer en la parábola de la moneda perdida?', options: ['Un denario', 'Un talento', 'Una dracma', 'Un siclo'], correctAnswer: 'Una dracma', verse: 'Lucas 15:8', category: 'Evangelios - Parábolas' },
    { id: 406, text: 'En la parábola de las diez vírgenes, ¿qué les faltaba a las vírgenes insensatas?', options: ['Agua', 'Pan', 'Aceite para sus lámparas', 'Invitaciones para la boda'], correctAnswer: 'Aceite para sus lámparas', verse: 'Mateo 25:3', category: 'Evangelios - Parábolas' },
    { id: 407, text: '¿Sobre qué construyó su casa el hombre prudente?', options: ['Sobre la arena', 'Sobre una colina', 'Sobre la roca', 'Cerca de un río'], correctAnswer: 'Sobre la roca', verse: 'Mateo 7:24', category: 'Evangelios - Parábolas' },

    // Evangelios - Milagros
    { id: 451, text: '¿Cuál fue el primer milagro de Jesús registrado en el Evangelio de Juan?', options: ['La alimentación de los 5000', 'Convertir el agua en vino', 'Caminar sobre el agua', 'Resucitar a Lázaro'], correctAnswer: 'Convertir el agua en vino', verse: 'Juan 2:1-11', category: 'Evangelios - Milagros' },
    { id: 452, text: '¿A cuántos hombres alimentó Jesús con cinco panes y dos peces?', options: ['1000', '3000', '5000', '10000'], correctAnswer: '5000', verse: 'Mateo 14:21', category: 'Evangelios - Milagros' },
    { id: 453, text: '¿Qué apóstol caminó sobre el agua con Jesús, pero luego dudó?', options: ['Juan', 'Santiago', 'Pedro', 'Andrés'], correctAnswer: 'Pedro', verse: 'Mateo 14:29', category: 'Evangelios - Milagros' },
    { id: 454, text: '¿Qué le dijo Jesús al ciego Bartimeo para que recuperara la vista?', options: ['"Tu fe te ha salvado"', '"Lávate en el estanque de Siloé"', '"Recibe la vista"', '"Tus pecados te son perdonados"'], correctAnswer: '"Tu fe te ha salvado"', verse: 'Marcos 10:52', category: 'Evangelios - Milagros' },
    { id: 455, text: '¿A quién resucitó Jesús después de haber estado muerto por cuatro días?', options: ['A la hija de Jairo', 'Al hijo de la viuda de Naín', 'A Lázaro', 'A Tabita'], correctAnswer: 'A Lázaro', verse: 'Juan 11:38-44', category: 'Evangelios - Milagros' },
    { id: 456, text: '¿En qué ciudad sanó Jesús al paralítico que fue bajado por el techo?', options: ['Nazaret', 'Jerusalén', 'Capernaum', 'Betania'], correctAnswer: 'Capernaum', verse: 'Marcos 2:1-5', category: 'Evangelios - Milagros' },

    // Hechos de los Apóstoles
    { id: 501, text: '¿Quién fue elegido para reemplazar a Judas Iscariote como apóstol?', options: ['Bernabé', 'Matías', 'Esteban', 'Silas'], correctAnswer: 'Matías', verse: 'Hechos 1:26', category: 'Hechos de los Apóstoles' },
    { id: 502, text: '¿Qué evento marcó el derramamiento del Espíritu Santo sobre los apóstoles en Pentecostés?', options: ['Un terremoto', 'El sonido de un viento recio y lenguas de fuego', 'Una visión de ángeles', 'La aparición de Jesús'], correctAnswer: 'El sonido de un viento recio y lenguas de fuego', verse: 'Hechos 2:2-4', category: 'Hechos de los Apóstoles' },
    { id: 503, text: '¿Quién fue el primer mártir cristiano?', options: ['Santiago', 'Pedro', 'Esteban', 'Pablo'], correctAnswer: 'Esteban', verse: 'Hechos 7:59-60', category: 'Hechos de los Apóstoles' },
    { id: 504, text: '¿Cómo se llamaba Saulo antes de su conversión?', options: ['Saulo', 'Tarso', 'Pablo', 'Agripa'], correctAnswer: 'Saulo', verse: 'Hechos 9:1', category: 'Hechos de los Apóstoles' },
    { id: 505, text: '¿Qué apóstol fue liberado de la cárcel por un ángel?', options: ['Pablo', 'Juan', 'Santiago', 'Pedro'], correctAnswer: 'Pedro', verse: 'Hechos 12:7-11', category: 'Hechos de los Apóstoles' },
    { id: 506, text: '¿A qué carcelero le dijeron Pablo y Silas: "Cree en el Señor Jesucristo, y serás salvo"?', options: ['Al carcelero de Roma', 'Al carcelero de Filipos', 'Al carcelero de Éfeso', 'Al carcelero de Corinto'], correctAnswer: 'Al carcelero de Filipos', verse: 'Hechos 16:31', category: 'Hechos de los Apóstoles' },

    // Cartas Paulinas
    { id: 601, text: '¿Qué carta es conocida como la "carta de la alegría"?', options: ['Romanos', 'Gálatas', 'Filipenses', 'Colosenses'], correctAnswer: 'Filipenses', verse: 'Filipenses 4:4', category: 'Cartas Paulinas' },
    { id: 602, text: 'En Romanos, ¿qué dice Pablo que es "poder de Dios para salvación"?', options: ['La ley', 'Las buenas obras', 'La fe', 'El evangelio'], correctAnswer: 'El evangelio', verse: 'Romanos 1:16', category: 'Cartas Paulinas' },
    { id: 603, text: '¿Cuáles son los tres elementos que permanecen según 1 Corintios 13?', options: ['Fe, esperanza y amor', 'Poder, gloria y honra', 'Justicia, paz y gozo', 'Profecía, ciencia y lenguas'], correctAnswer: 'Fe, esperanza y amor', verse: '1 Corintios 13:13', category: 'Cartas Paulinas' },
    { id: 604, text: '¿Cuál es el tema principal de la carta a los Gálatas?', options: ['La unidad de la iglesia', 'La segunda venida de Cristo', 'La libertad en Cristo frente a la ley', 'El comportamiento en la iglesia'], correctAnswer: 'La libertad en Cristo frente a la ley', verse: 'Gálatas 5:1', category: 'Cartas Paulinas' },
    { id: 605, text: '¿A quién se refiere Pablo como su "verdadero hijo en la fe"?', options: ['Tito', 'Timoteo', 'Lucas', 'Onésimo'], correctAnswer: 'Timoteo', verse: '1 Timoteo 1:2', category: 'Cartas Paulinas' },
    { id: 606, text: '¿Qué describe Pablo en Efesios 6 como la "armadura de Dios"?', options: ['Un conjunto de ropas santas', 'Un sistema de defensa espiritual', 'Un plan de batalla literal', 'Las murallas de una ciudad'], correctAnswer: 'Un sistema de defensa espiritual', verse: 'Efesios 6:11', category: 'Cartas Paulinas' },
    
    // Profetas
    { id: 701, text: '¿Qué profeta fue arrojado a un foso de leones?', options: ['Isaías', 'Jeremías', 'Daniel', 'Ezequiel'], correctAnswer: 'Daniel', verse: 'Daniel 6:16', category: 'Profetas' },
    { id: 702, text: '¿Qué visión tuvo Isaías en el templo el año en que murió el rey Uzías?', options: ['La visión de la santidad de Dios', 'Un valle de huesos secos', 'Cuatro bestias terribles', 'Un carro de fuego'], correctAnswer: 'La visión de la santidad de Dios', verse: 'Isaías 6:1-3', category: 'Profetas' },
    { id: 703, text: '¿A qué profeta se le conoce como "el profeta llorón"?', options: ['Oseas', 'Amós', 'Jeremías', 'Jonás'], correctAnswer: 'Jeremías', verse: 'Jeremías 9:1', category: 'Profetas' },
    { id: 704, text: '¿Qué profeta tuvo una visión de un valle de huesos secos que volvían a la vida?', options: ['Daniel', 'Ezequiel', 'Isaías', 'Zacarías'], correctAnswer: 'Ezequiel', verse: 'Ezequiel 37:1-10', category: 'Profetas' },
    { id: 705, text: '¿Quiénes eran los tres amigos de Daniel que fueron arrojados al horno de fuego?', options: ['Sadrac, Mesac y Abed-nego', 'Josué, Caleb y Finees', 'Elifaz, Bildad y Zofar', 'Ananías, Misael y Azarías'], correctAnswer: 'Sadrac, Mesac y Abed-nego', verse: 'Daniel 3:20-23', category: 'Profetas' },
    { id: 706, text: '¿A qué ciudad fue enviado el profeta Jonás a predicar, en contra de su voluntad?', options: ['Babilonia', 'Tarsis', 'Nínive', 'Damasco'], correctAnswer: 'Nínive', verse: 'Jonás 1:2', category: 'Profetas' },
    { id: 707, text: '¿Qué profeta anunció que el Mesías nacería en Belén?', options: ['Isaías', 'Miqueas', 'Jeremías', 'Malaquías'], correctAnswer: 'Miqueas', verse: 'Miqueas 5:2', category: 'Profetas' },

    // Salmos y Proverbios
    { id: 801, text: '¿Cuál es el primer Salmo?', options: ['El Señor es mi pastor', 'El que habita al abrigo del Altísimo', 'Bienaventurado el varón que no anduvo en consejo de malos', 'Alabad a Jehová, naciones todas'], correctAnswer: 'Bienaventurado el varón que no anduvo en consejo de malos', verse: 'Salmo 1:1', category: 'Salmos y Proverbios' },
    { id: 802, text: '¿Qué dice Proverbios 3:5-6 que debemos hacer?', options: ['Confiar en Jehová con todo nuestro corazón', 'Ser sabios en nuestra propia opinión', 'Acumular riquezas', 'Hablar mucho'], correctAnswer: 'Confiar en Jehová con todo nuestro corazón', verse: 'Proverbios 3:5-6', category: 'Salmos y Proverbios' },
    { id: 803, text: 'Según el Salmo 23, ¿qué prepara Dios delante de nosotros en presencia de nuestros angustiadores?', options: ['Un camino', 'Una mesa', 'Un ejército', 'Una corona'], correctAnswer: 'Una mesa', verse: 'Salmo 23:5', category: 'Salmos y Proverbios' },
    { id: 804, text: '¿Qué es "el principio de la sabiduría" según Proverbios 1:7?', options: ['La mucha experiencia', 'El temor de Jehová', 'El estudio de la ley', 'La obediencia a los padres'], correctAnswer: 'El temor de Jehová', verse: 'Proverbios 1:7', category: 'Salmos y Proverbios' },
    { id: 805, text: '¿Cuántos Salmos hay en la Biblia?', options: ['100', '120', '150', '175'], correctAnswer: '150', verse: 'N/A', category: 'Salmos y Proverbios' },

    // Apocalipsis
    { id: 901, text: '¿A cuántas iglesias de Asia se dirigen las cartas al principio de Apocalipsis?', options: ['Tres', 'Cinco', 'Siete', 'Doce'], correctAnswer: 'Siete', verse: 'Apocalipsis 1:4', category: 'Apocalipsis' },
    { id: 902, text: '¿Quién es descrito como "el Cordero que fue inmolado"?', options: ['Juan el Bautista', 'El apóstol Pablo', 'Un ángel poderoso', 'Jesucristo'], correctAnswer: 'Jesucristo', verse: 'Apocalipsis 5:12', category: 'Apocalipsis' },
    { id: 903, text: '¿Cuántos sellos, trompetas y copas se mencionan en Apocalipsis?', options: ['Cinco de cada uno', 'Siete de cada uno', 'Diez de cada uno', 'Doce de cada uno'], correctAnswer: 'Siete de cada uno', verse: 'Apocalipsis 6, 8, 16', category: 'Apocalipsis' },
    { id: 904, text: '¿Qué ciudad celestial desciende del cielo al final del libro?', options: ['La Nueva Roma', 'La Nueva Jerusalén', 'El Edén restaurado', 'La Sión celestial'], correctAnswer: 'La Nueva Jerusalén', verse: 'Apocalipsis 21:2', category: 'Apocalipsis' },
    { id: 905, text: '¿Cuál es la última promesa de Jesús en el libro de Apocalipsis?', options: ['"He aquí, yo hago nuevas todas las cosas"', '"Ciertamente vengo en breve"', '"Yo soy el Alfa y la Omega"', '"El que venciere heredará todas las cosas"'], correctAnswer: '"Ciertamente vengo en breve"', verse: 'Apocalipsis 22:20', category: 'Apocalipsis' },

    // Personajes Bíblicos
    { id: 1001, text: '¿Qué mujer jueza de Israel lideró al pueblo a la victoria contra Sísara?', options: ['Ester', 'Rut', 'Débora', 'Jael'], correctAnswer: 'Débora', verse: 'Jueces 4:4-9', category: 'Personajes Bíblicos' },
    { id: 1002, text: '¿Quién fue el padre de Juan el Bautista?', options: ['Simeón', 'José', 'Zacarías', 'Nicodemo'], correctAnswer: 'Zacarías', verse: 'Lucas 1:5', category: 'Personajes Bíblicos' },
    { id: 1003, text: '¿Qué discípulo era conocido como "el incrédulo"?', options: ['Felipe', 'Tomás', 'Mateo', 'Tadeo'], correctAnswer: 'Tomás', verse: 'Juan 20:24-25', category: 'Personajes Bíblicos' },
    { id: 1004, text: '¿Quién era la esposa de Isaac?', options: ['Sara', 'Lea', 'Raquel', 'Rebeca'], correctAnswer: 'Rebeca', verse: 'Génesis 24:67', category: 'Personajes Bíblicos' },
    { id: 1005, text: '¿Qué personaje bíblico era conocido por su increíble fuerza, la cual residía en su cabello?', options: ['David', 'Sansón', 'Gedeón', 'Goliat'], correctAnswer: 'Sansón', verse: 'Jueces 16:17', category: 'Personajes Bíblicos' },

    // Lugares Bíblicos
    { id: 1101, text: '¿En qué río fue bautizado Jesús?', options: ['Nilo', 'Éufrates', 'Jordán', 'Tigris'], correctAnswer: 'Jordán', verse: 'Mateo 3:13', category: 'Lugares Bíblicos' },
    { id: 1102, text: '¿Qué ciudad es conocida como la "Ciudad de David"?', options: ['Belén', 'Nazaret', 'Jerusalén', 'Hebrón'], correctAnswer: 'Jerusalén', verse: '2 Samuel 5:7', category: 'Lugares Bíblicos' },
    { id: 1103, text: '¿Desde qué monte ascendió Jesús al cielo?', options: ['Monte Sinaí', 'Monte Carmelo', 'Monte de los Olivos', 'Monte Hermón'], correctAnswer: 'Monte de los Olivos', verse: 'Hechos 1:9-12', category: 'Lugares Bíblicos' },
    { id: 1104, text: '¿En qué ciudad cayeron los muros después de que los israelitas marcharan a su alrededor?', options: ['Hai', 'Jericó', 'Gabaón', 'Siquem'], correctAnswer: 'Jericó', verse: 'Josué 6:20', category: 'Lugares Bíblicos' },

    // Doctrina y Teología
    { id: 1201, text: '¿Qué es la Trinidad?', options: ['Tres dioses diferentes', 'Un Dios en tres personas: Padre, Hijo y Espíritu Santo', 'Tres manifestaciones de Dios en diferentes épocas', 'Un concepto no bíblico'], correctAnswer: 'Un Dios en tres personas: Padre, Hijo y Espíritu Santo', verse: 'Mateo 28:19', category: 'Doctrina y Teología' },
    { id: 1202, text: '¿Qué significa "justificación por la fe"?', options: ['Ser declarado justo ante Dios a través de la fe en Cristo', 'Hacer buenas obras para ganar el favor de Dios', 'Ser una buena persona', 'Cumplir toda la ley de Moisés'], correctAnswer: 'Ser declarado justo ante Dios a través de la fe en Cristo', verse: 'Romanos 5:1', category: 'Doctrina y Teología' },
    { id: 1203, text: '¿Qué es la "Gran Comisión"?', options: ['El mandamiento de amar a Dios y al prójimo', 'La orden de Jesús de ir y hacer discípulos a todas las naciones', 'La construcción del Templo de Salomón', 'La entrega de los Diez Mandamientos'], correctAnswer: 'La orden de Jesús de ir y hacer discípulos a todas las naciones', verse: 'Mateo 28:19-20', category: 'Doctrina y Teología' }
  ];

  constructor() {
    // Add more questions programmatically if needed
    const moreQuestions: Question[] = [];
    for (let i = 0; i < 150; i++) {
        // This is a placeholder for a much larger, manually created set.
        // In a real scenario, you wouldn't generate random questions like this.
        // For this task, the manually curated list above is sufficient.
    }
    this.questions.push(...moreQuestions);
  }

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
