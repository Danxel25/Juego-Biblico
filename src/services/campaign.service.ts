import { Injectable, signal, effect } from '@angular/core';
import { BibleBook, UserCampaignProgress, BibleChapter, CampaignStage } from '../models/campaign.model';

// Datos para el libro de Génesis
const GENESIS_BOOK_DATA: BibleBook = {
  id: 'genesis',
  title: 'Génesis',
  totalChapters: 50,
  stages: [
    {
      title: 'Etapa 1: La Creación y la Caída',
      description: 'El comienzo de todo, desde la creación del mundo hasta las primeras generaciones de la humanidad.',
      chapters: [
        {
          id: 1,
          title: 'Capítulo 1: La Creación',
          description: 'El relato de los siete días de la creación.',
          isTestChapter: false,
          activities: [
            { id: 'gen-1-1', type: 'pregunta_profunda', questionText: '¿Qué creó Dios en el primer día?', options: ['Los animales', 'El sol y la luna', 'La luz', 'El firmamento'], correctAnswer: 'La luz', verse: 'Génesis 1:3-5' },
            { id: 'gen-1-2', type: 'pregunta_profunda', questionText: '¿En qué día fueron creados los grandes monstruos marinos y las aves?', options: ['Tercero', 'Cuarto', 'Quinto', 'Sexto'], correctAnswer: 'Quinto', verse: 'Génesis 1:20-23' },
            { id: 'gen-1-3', type: 'completar_versiculo', questionText: 'Y dijo Dios: Sea la ______ en medio de las aguas, y separe las aguas de las aguas.', options: ['tierra', 'luz', 'expansión', 'vida'], correctAnswer: 'expansión', verse: 'Génesis 1:6' },
            { id: 'gen-1-4', type: 'pregunta_profunda', questionText: '¿Qué dos "lumbreras grandes" hizo Dios en el cuarto día?', options: ['Sol y Estrellas', 'Sol y Luna', 'Luna y Lucero', 'Venus y Marte'], correctAnswer: 'Sol y Luna', verse: 'Génesis 1:16' },
            { id: 'gen-1-5', type: 'pregunta_profunda', questionText: '¿A imagen de quién fue creado el ser humano?', options: ['Los ángeles', 'La creación', 'Dios', 'Los querubines'], correctAnswer: 'Dios', verse: 'Génesis 1:27' },
            { id: 'gen-1-6', type: 'pregunta_profunda', questionText: '¿Qué mandato les dio Dios a los seres humanos después de crearlos?', options: ['Descansar', 'Construir un templo', 'Fructificad y multiplicaos', 'Nombrar las estrellas'], correctAnswer: 'Fructificad y multiplicaos', verse: 'Génesis 1:28' },
            { id: 'gen-1-7', type: 'completar_versiculo', questionText: 'Y vio Dios todo lo que había hecho, y he aquí que era ______ en gran manera.', options: ['bueno', 'perfecto', 'completo', 'santo'], correctAnswer: 'bueno', verse: 'Génesis 1:31' },
          ],
        },
        {
          id: 2,
          title: 'Capítulo 2: El Jardín del Edén',
          description: 'La formación de Adán, Eva y el huerto.',
          isTestChapter: false,
          activities: [
            { id: 'gen-2-1', type: 'pregunta_profunda', questionText: '¿De qué material formó Dios al hombre?', options: ['Agua', 'Polvo de la tierra', 'Luz', 'Una costilla'], correctAnswer: 'Polvo de la tierra', verse: 'Génesis 2:7' },
            { id: 'gen-2-2', type: 'pregunta_profunda', questionText: '¿Qué dos árboles especiales se mencionan en medio del huerto del Edén?', options: ['El árbol del bien y el mal, y el Sicómoro', 'El árbol de la Vida y el Olivo', 'El árbol de la Vida y el árbol de la ciencia del bien y del mal', 'La Higuera y el Cedro'], correctAnswer: 'El árbol de la Vida y el árbol de la ciencia del bien y del mal', verse: 'Génesis 2:9' },
            { id: 'gen-2-3', type: 'completar_versiculo', questionText: 'Y mandó Jehová Dios al hombre, diciendo: De todo árbol del huerto podrás ______.', options: ['mirar', 'comer', 'cuidar', 'aprender'], correctAnswer: 'comer', verse: 'Génesis 2:16' },
            { id: 'gen-2-4', type: 'pregunta_profunda', questionText: '¿Por qué dijo Dios que "No es bueno que el hombre esté solo"?', options: ['Porque el huerto era muy grande', 'Porque necesitaba ayuda para nombrar a los animales', 'Porque no halló ayuda idónea para él entre los animales', 'Porque necesitaba con quién hablar'], correctAnswer: 'Porque no halló ayuda idónea para él entre los animales', verse: 'Génesis 2:18-20' },
            { id: 'gen-2-5', type: 'pregunta_profunda', questionText: '¿Cómo fue creada Eva?', options: ['Del polvo', 'De una costilla de Adán', 'De una flor', 'Por la palabra de Dios'], correctAnswer: 'De una costilla de Adán', verse: 'Génesis 2:21-22' },
            { id: 'gen-2-6', type: 'pregunta_profunda', questionText: '¿Cómo estaban Adán y Eva en el huerto antes de pecar, y no se avergonzaban?', options: ['Vestidos con hojas', 'Solos', 'Desnudos', 'Cantando'], correctAnswer: 'Desnudos', verse: 'Génesis 2:25' },
            { id: 'gen-2-7', type: 'completar_versiculo', questionText: 'Por tanto, dejará el hombre a su padre y a su madre, y se unirá a su mujer, y serán una sola ______.', options: ['familia', 'carne', 'alma', 'pareja'], correctAnswer: 'carne', verse: 'Génesis 2:24' },
          ],
        },
        {
          id: 3,
          title: 'Capítulo 3: La Caída del Hombre',
          description: 'La desobediencia y sus consecuencias.',
          isTestChapter: false,
          activities: [
            { id: 'gen-3-1', type: 'pregunta_profunda', questionText: '¿Quién tentó a Eva para que comiera del fruto prohibido?', options: ['Un ángel', 'La serpiente', 'Adán', 'Un querubín'], correctAnswer: 'La serpiente', verse: 'Génesis 3:1' },
            { id: 'gen-3-2', type: 'pregunta_profunda', questionText: '¿Qué fue lo primero que Adán y Eva notaron después de comer el fruto?', options: ['Que tenían hambre', 'Que estaban desnudos', 'Que los animales hablaban', 'Que Dios venía'], correctAnswer: 'Que estaban desnudos', verse: 'Génesis 3:7' },
            { id: 'gen-3-3', type: 'pregunta_profunda', questionText: '¿Qué hizo Adán cuando Dios le preguntó si había comido del árbol?', options: ['Se arrepintió inmediatamente', 'Negó haberlo hecho', 'Culpó a Eva', 'Se escondió en silencio'], correctAnswer: 'Culpó a Eva', verse: 'Génesis 3:12' },
            { id: 'gen-3-4', type: 'pregunta_profunda', questionText: '¿Cuál fue parte de la maldición de la serpiente?', options: ['Perdería su veneno', 'Se arrastraría sobre su pecho', 'No podría hablar más', 'Sería la más pequeña de las bestias'], correctAnswer: 'Se arrastraría sobre su pecho', verse: 'Génesis 3:14' },
            { id: 'gen-3-5', type: 'completar_versiculo', questionText: 'Y pondré ______ entre ti y la mujer, y entre tu simiente y la simiente suya.', options: ['amistad', 'enemistad', 'un muro', 'un río'], correctAnswer: 'enemistad', verse: 'Génesis 3:15' },
            { id: 'gen-3-6', type: 'pregunta_profunda', questionText: '¿Con qué vistió Dios a Adán y Eva después de que pecaron?', options: ['Hojas de higuera', 'Túnicas de lino', 'Túnicas de pieles', 'Nada'], correctAnswer: 'Túnicas de pieles', verse: 'Génesis 3:21' },
            { id: 'gen-3-7', type: 'pregunta_profunda', questionText: '¿Qué puso Dios para guardar el camino del árbol de la vida?', options: ['Un león', 'Un muro de fuego', 'Un ángel poderoso', 'Querubines y una espada encendida'], correctAnswer: 'Querubines y una espada encendida', verse: 'Génesis 3:24' },
          ],
        },
        {
          id: 4,
          title: 'Capítulo 4: Caín y Abel',
          description: 'La historia del primer asesinato.',
          isTestChapter: false,
          activities: [
            { id: 'gen-4-1', type: 'pregunta_profunda', questionText: '¿A qué se dedicaba Abel?', options: ['Agricultor', 'Pastor de ovejas', 'Cazador', 'Constructor'], correctAnswer: 'Pastor de ovejas', verse: 'Génesis 4:2' },
            { id: 'gen-4-2', type: 'pregunta_profunda', questionText: '¿Qué ofrenda trajo Caín al Señor?', options: ['Las primicias de su rebaño', 'Un cordero sin defecto', 'Fruto de la tierra', 'Oro e incienso'], correctAnswer: 'Fruto de la tierra', verse: 'Génesis 4:3' },
            { id: 'gen-4-3', type: 'pregunta_profunda', questionText: '¿Por qué se ensañó Caín contra su hermano Abel?', options: ['Por una disputa de tierras', 'Porque Dios miró con agrado la ofrenda de Abel y no la suya', 'Porque Abel se burló de él', 'Por un mandato de la serpiente'], correctAnswer: 'Porque Dios miró con agrado la ofrenda de Abel y no la suya', verse: 'Génesis 4:4-5' },
            { id: 'gen-4-4', type: 'completar_versiculo', questionText: 'Y Jehová dijo a Caín: ¿Por qué te has ensañado, y por qué ha decaído tu ______?', options: ['fuerza', 'semblante', 'fe', 'voz'], correctAnswer: 'semblante', verse: 'Génesis 4:6' },
            { id: 'gen-4-5', type: 'pregunta_profunda', questionText: '¿Cuál fue el castigo de Caín por matar a Abel?', options: ['La muerte', 'Ser esclavo por siempre', 'Ser errante y extranjero en la tierra', 'Perder la vista'], correctAnswer: 'Ser errante y extranjero en la tierra', verse: 'Génesis 4:12' },
            { id: 'gen-4-6', type: 'pregunta_profunda', questionText: '¿Qué señal puso Dios en Caín?', options: ['Para que todos lo reconocieran y lo castigaran', 'Para que nadie que le hallara le matase', 'Para que no pudiera hablar', 'Para que olvidara lo que hizo'], correctAnswer: 'Para que nadie que le hallara le matase', verse: 'Génesis 4:15' },
            { id: 'gen-4-7', type: 'pregunta_profunda', questionText: '¿Quién fue el hijo que Dios le dio a Adán y Eva para sustituir a Abel?', options: ['Enoc', 'Lamec', 'Set', 'Jared'], correctAnswer: 'Set', verse: 'Génesis 4:25' },
          ],
        },
        {
          id: 5,
          title: 'Prueba: Los Primeros Días',
          description: 'Demuestra tu conocimiento sobre los inicios.',
          isTestChapter: true,
          activities: [
            { id: 'gen-test-1-1', type: 'pregunta_profunda', questionText: '¿Qué descansó Dios en el séptimo día?', options: ['De nombrar a los animales', 'De toda la obra que hizo en la creación', 'De hablar con Adán', 'De separar la luz de las tinieblas'], correctAnswer: 'De toda la obra que hizo en la creación', verse: 'Génesis 2:2' },
            { id: 'gen-test-1-2', type: 'pregunta_profunda', questionText: '¿Qué animal fue "más astuto que todos los animales del campo"?', options: ['El león', 'El águila', 'La serpiente', 'El zorro'], correctAnswer: 'La serpiente', verse: 'Génesis 3:1' },
            { id: 'gen-test-1-3', type: 'pregunta_profunda', questionText: '¿Quién fue el primer hombre en la Biblia que practicó la poligamia?', options: ['Caín', 'Adán', 'Lamec', 'Enoc'], correctAnswer: 'Lamec', verse: 'Génesis 4:19' },
            { id: 'gen-test-1-4', type: 'pregunta_profunda', questionText: '¿Quién fue el hombre que "anduvo con Dios, y desapareció, porque le llevó Dios"?', options: ['Matusalén', 'Enoc', 'Noé', 'Set'], correctAnswer: 'Enoc', verse: 'Génesis 5:24' },
            { id: 'gen-test-1-5', type: 'pregunta_profunda', questionText: '¿Cuál fue la descendencia de Caín conocida por su trabajo con metales y música?', options: ['Los hijos de Set', 'Los hijos de Enoc', 'Los hijos de Lamec (Jabal, Jubal, Tubal-caín)', 'Los hijos de Adán'], correctAnswer: 'Los hijos de Lamec (Jabal, Jubal, Tubal-caín)', verse: 'Génesis 4:20-22' },
            { id: 'gen-test-1-6', type: 'pregunta_profunda', questionText: '¿Quién fue el hombre que vivió más años según la Biblia?', options: ['Adán', 'Noé', 'Enoc', 'Matusalén'], correctAnswer: 'Matusalén', verse: 'Génesis 5:27' },
            { id: 'gen-test-1-7', type: 'pregunta_profunda', questionText: '¿Cuál fue una de las consecuencias directas para la mujer tras la Caída?', options: ['No podría tener hijos', 'Tendría enemistad con los animales', 'Con dolor daría a luz los hijos', 'No podría entrar más al Edén'], correctAnswer: 'Con dolor daría a luz los hijos', verse: 'Génesis 3:16' },
          ],
        },
      ]
    },
    {
      title: 'Etapa 2: El Diluvio y la Dispersión',
      description: 'La historia de Noé, el gran diluvio que reinició el mundo y el origen de las naciones.',
      chapters: [
         {
          id: 6,
          title: 'Capítulo 6-7: El Arca de Noé',
          description: 'La construcción del arca y el inicio del diluvio.',
          isTestChapter: false,
          activities: [
            { id: 'gen-6-1', type: 'pregunta_profunda', questionText: '¿Por qué decidió Dios destruir la tierra con un diluvio?', options: ['Porque la tierra envejeció', 'Porque la maldad de los hombres era mucha', 'Porque los animales se rebelaron', 'Para crear nuevas montañas'], correctAnswer: 'Porque la maldad de los hombres era mucha', verse: 'Génesis 6:5' },
            { id: 'gen-6-2', type: 'pregunta_profunda', questionText: '¿Por qué Noé halló gracia ante los ojos de Dios?', options: ['Porque era rico', 'Porque era un gran constructor', 'Porque era varón justo, perfecto en sus generaciones', 'Porque hizo una gran ofrenda'], correctAnswer: 'Porque era varón justo, perfecto en sus generaciones', verse: 'Génesis 6:8-9' },
            { id: 'gen-6-3', type: 'pregunta_profunda', questionText: '¿De qué madera le dijo Dios a Noé que hiciera el arca?', options: ['Roble', 'Cedro', 'Gofer', 'Olivo'], correctAnswer: 'Gofer', verse: 'Génesis 6:14' },
            { id: 'gen-6-4', type: 'pregunta_profunda', questionText: '¿Cuántos de cada animal limpio debía llevar Noé en el arca?', options: ['Dos, macho y hembra', 'Siete parejas', 'Una pareja', 'Catorce parejas'], correctAnswer: 'Siete parejas', verse: 'Génesis 7:2' },
            { id: 'gen-6-5', type: 'pregunta_profunda', questionText: '¿Quiénes entraron al arca con Noé?', options: ['Solo él y su esposa', 'Su esposa, sus hijos y las mujeres de sus hijos', 'Todos sus parientes', 'Sus hijos y sus siervos'], correctAnswer: 'Su esposa, sus hijos y las mujeres de sus hijos', verse: 'Génesis 7:7' },
            { id: 'gen-6-6', type: 'pregunta_profunda', questionText: '¿Cuántos días y noches llovió sobre la tierra durante el diluvio?', options: ['7', '30', '40', '150'], correctAnswer: '40', verse: 'Génesis 7:12' },
            { id: 'gen-6-7', type: 'completar_versiculo', questionText: 'Y las aguas subieron mucho sobre la tierra; y todos los montes altos que había debajo de todos los cielos, fueron ______.', options: ['movidos', 'cubiertos', 'aplanados', 'vistos'], correctAnswer: 'cubiertos', verse: 'Génesis 7:19' },
          ]
        },
        {
          id: 8,
          title: 'Capítulo 8-9: El Pacto del Arcoíris',
          description: 'El fin del diluvio y la promesa de Dios.',
          isTestChapter: false,
          activities: [
             { id: 'gen-8-1', type: 'pregunta_profunda', questionText: '¿Qué ave envió Noé primero fuera del arca para ver si las aguas se habían retirado?', options: ['Una paloma', 'Un gorrión', 'Un cuervo', 'Un águila'], correctAnswer: 'Un cuervo', verse: 'Génesis 8:7' },
             { id: 'gen-8-2', type: 'pregunta_profunda', questionText: '¿Qué trajo la paloma en su pico la segunda vez que Noé la envió?', options: ['Nada', 'Una rama de vid', 'Una hoja de olivo', 'Un poco de tierra'], correctAnswer: 'Una hoja de olivo', verse: 'Génesis 8:11' },
             { id: 'gen-8-3', type: 'pregunta_profunda', questionText: '¿Qué fue lo primero que hizo Noé al salir del arca?', options: ['Plantar una viña', 'Construir una casa', 'Edificar un altar y ofrecer holocaustos', 'Buscar a otros sobrevivientes'], correctAnswer: 'Edificar un altar y ofrecer holocaustos', verse: 'Génesis 8:20' },
             { id: 'gen-8-4', type: 'pregunta_profunda', questionText: '¿Qué señal estableció Dios como recuerdo de su pacto de no volver a destruir la tierra con agua?', options: ['Una estrella', 'Una nube especial', 'El arcoíris', 'El sol de medianoche'], correctAnswer: 'El arcoíris', verse: 'Génesis 9:13' },
             { id: 'gen-8-5', type: 'completar_versiculo', questionText: 'Mas la carne con su vida, que es su ______, no comeréis.', options: ['grasa', 'piel', 'sangre', 'hueso'], correctAnswer: 'sangre', verse: 'Génesis 9:4' },
             { id: 'gen-8-6', type: 'pregunta_profunda', questionText: '¿Cuál de los hijos de Noé vio la desnudez de su padre y fue maldecido?', options: ['Sem', 'Cam', 'Jafet', 'Ninguno'], correctAnswer: 'Cam', verse: 'Génesis 9:22-25' },
             { id: 'gen-8-7', type: 'pregunta_profunda', questionText: '¿A quién maldijo Noé a causa de la acción de Cam?', options: ['A Cam directamente', 'A todos sus descendientes', 'A Canaán, hijo de Cam', 'A sí mismo'], correctAnswer: 'A Canaán, hijo de Cam', verse: 'Génesis 9:25' },
          ]
        },
        {
          id: 11,
          title: 'Capítulo 11: La Torre de Babel',
          description: 'La humanidad se une con orgullo y es dispersada.',
          isTestChapter: false,
          activities: [
            { id: 'gen-11-1', type: 'pregunta_profunda', questionText: '¿Qué tenían en común todos los habitantes de la tierra en ese tiempo?', options: ['La misma altura', 'El mismo rey', 'Una sola lengua y unas mismas palabras', 'La misma religión'], correctAnswer: 'Una sola lengua y unas mismas palabras', verse: 'Génesis 11:1' },
            { id: 'gen-11-2', type: 'pregunta_profunda', questionText: '¿Qué material usaron para construir la ciudad y la torre?', options: ['Piedra y mortero', 'Madera y clavos', 'Ladrillo y asfalto', 'Mármol y oro'], correctAnswer: 'Ladrillo y asfalto', verse: 'Génesis 11:3' },
            { id: 'gen-11-3', type: 'pregunta_profunda', questionText: '¿Cuál era el propósito principal de construir la torre de Babel?', options: ['Para adorar al sol', 'Para tener un lugar alto y seguro', 'Para hacerse un nombre y no ser esparcidos', 'Para llegar al cielo literalmente'], correctAnswer: 'Para hacerse un nombre y no ser esparcidos', verse: 'Génesis 11:4' },
            { id: 'gen-11-4', type: 'pregunta_profunda', questionText: '¿Qué hizo Dios cuando vio la ciudad y la torre que construían?', options: ['Les envió un diluvio', 'Destruyó la torre con fuego', 'Confundió su lengua', 'Los felicitó por su ingenio'], correctAnswer: 'Confundió su lengua', verse: 'Génesis 11:7' },
            { id: 'gen-11-5', type: 'pregunta_profunda', questionText: '¿Cuál fue la consecuencia directa de la confusión de lenguas?', options: ['Dejaron de construir y fueron esparcidos', 'Aprendieron a hablar muchos idiomas', 'Se hicieron la guerra unos a otros', 'Construyeron templos a diferentes dioses'], correctAnswer: 'Dejaron de construir y fueron esparcidos', verse: 'Génesis 11:8' },
            { id: 'gen-11-6', type: 'completar_versiculo', questionText: 'Por esto fue llamado el nombre de ella ______, porque allí confundió Jehová el lenguaje de toda la tierra.', options: ['Sinar', 'Ur', 'Babel', 'Canaán'], correctAnswer: 'Babel', verse: 'Génesis 11:9' },
            { id: 'gen-11-7', type: 'pregunta_profunda', questionText: '¿Quién era el padre de Abram, que salió de Ur de los caldeos?', options: ['Harán', 'Taré', 'Nacor', 'Sem'], correctAnswer: 'Taré', verse: 'Génesis 11:27-31' },
          ]
        },
        {
          id: 12,
          title: 'Prueba: Un Mundo Reiniciado',
          description: 'Evalúa tu entendimiento sobre Noé y Babel.',
          isTestChapter: true,
          activities: [
            { id: 'gen-test-2-1', type: 'pregunta_profunda', questionText: '¿Cuántos años tenía Noé cuando vino el diluvio?', options: ['100', '500', '600', '950'], correctAnswer: '600', verse: 'Génesis 7:6' },
            { id: 'gen-test-2-2', type: 'pregunta_profunda', questionText: 'Además de la lluvia, ¿de dónde más provinieron las aguas del diluvio?', options: ['De los mares', 'Fueron rotas las fuentes del grande abismo', 'De los ríos de Edén', 'De glaciares derretidos'], correctAnswer: 'Fueron rotas las fuentes del grande abismo', verse: 'Génesis 7:11' },
            { id: 'gen-test-2-3', type: 'pregunta_profunda', questionText: '¿Sobre qué montes reposó el arca cuando las aguas descendieron?', options: ['Monte Sinaí', 'Monte de los Olivos', 'Montes de Ararat', 'Monte Carmelo'], correctAnswer: 'Montes de Ararat', verse: 'Génesis 8:4' },
            { id: 'gen-test-2-4', type: 'pregunta_profunda', questionText: '¿Qué permiso le dio Dios a la humanidad después del diluvio que no se menciona antes?', options: ['Cantar alabanzas', 'Construir ciudades', 'Comer carne de animales', 'Navegar los mares'], correctAnswer: 'Comer carne de animales', verse: 'Génesis 9:3' },
            { id: 'gen-test-2-5', type: 'pregunta_profunda', questionText: '¿De cuál de los hijos de Noé desciende Abram (Abraham)?', options: ['Cam', 'Jafet', 'Set', 'Sem'], correctAnswer: 'Sem', verse: 'Génesis 11:10-26' },
            { id: 'gen-test-2-6', type: 'pregunta_profunda', questionText: '¿Cómo se llamaba la esposa de Abram?', options: ['Sara', 'Rebeca', 'Sarai', 'Agar'], correctAnswer: 'Sarai', verse: 'Génesis 11:29' },
            { id: 'gen-test-2-7', type: 'pregunta_profunda', questionText: '¿En qué tierra murió Taré, el padre de Abram?', options: ['Ur de los caldeos', 'Canaán', 'Egipto', 'Harán'], correctAnswer: 'Harán', verse: 'Génesis 11:32' },
          ]
        },
      ]
    },
    {
      title: 'Etapa 3: El Viaje de Abraham',
      description: 'El llamado de Abraham, el padre de la fe, y las promesas que Dios le hizo a él y a su descendencia.',
      chapters: [
         {
          id: 13,
          title: 'Capítulo 12: El Llamado de Abram',
          description: 'Dios llama a Abram y le promete una gran nación.',
          isTestChapter: false,
          activities: [
            { id: 'gen-13-1', type: 'completar_versiculo', questionText: 'Pero Jehová había dicho a Abram: Vete de tu tierra y de tu parentela, y de la casa de tu padre, a la tierra que te ______.', options: ['compré', 'mostraré', 'regalé', 'describiré'], correctAnswer: 'mostraré', verse: 'Génesis 12:1' },
            { id: 'gen-13-2', type: 'pregunta_profunda', questionText: '¿Cuál de estas NO fue una de las promesas que Dios le hizo a Abram en Génesis 12?', options: ['Haré de ti una nación grande', 'Te daré un palacio de oro', 'Bendeciré a los que te bendijeren', 'Serán benditas en ti todas las familias de la tierra'], correctAnswer: 'Te daré un palacio de oro', verse: 'Génesis 12:2-3' },
            { id: 'gen-13-3', type: 'pregunta_profunda', questionText: '¿Quién acompañó a Abram cuando salió de Harán?', options: ['Solo su esposa Sarai', 'Su padre Taré', 'Su sobrino Lot', 'Sus hermanos Nacor y Harán'], correctAnswer: 'Su sobrino Lot', verse: 'Génesis 12:5' },
            { id: 'gen-13-4', type: 'pregunta_profunda', questionText: '¿Por qué Abram fue a Egipto?', options: ['Para hacer comercio', 'Porque Dios se lo ordenó', 'Porque hubo hambre en la tierra', 'Para visitar a un pariente'], correctAnswer: 'Porque hubo hambre en la tierra', verse: 'Génesis 12:10' },
            { id: 'gen-13-5', type: 'pregunta_profunda', questionText: '¿Qué le dijo Abram a Sarai que dijera en Egipto por temor a que lo mataran?', options: ['Que era su sierva', 'Que era su hermana', 'Que era viuda', 'Que no lo conocía'], correctAnswer: 'Que era su hermana', verse: 'Génesis 12:13' },
            { id: 'gen-13-6', type: 'pregunta_profunda', questionText: '¿Cómo supo Faraón que Sarai era en realidad la esposa de Abram?', options: ['Sarai se lo confesó', 'Un siervo los escuchó', 'Jehová hirió a Faraón y a su casa con grandes plagas', 'Lot se lo dijo'], correctAnswer: 'Jehová hirió a Faraón y a su casa con grandes plagas', verse: 'Génesis 12:17' },
            { id: 'gen-13-7', type: 'pregunta_profunda', questionText: '¿Qué hizo Faraón después de descubrir la verdad sobre Abram y Sarai?', options: ['Los encarceló', 'Los expulsó de Egipto', 'Los hizo sus consejeros', 'Le quitó a Abram sus riquezas'], correctAnswer: 'Los expulsó de Egipto', verse: 'Génesis 12:19-20' },
          ]
        },
        {
          id: 15,
          title: 'Capítulo 15: El Pacto de Dios',
          description: 'La promesa de un heredero y una tierra.',
          isTestChapter: false,
          activities: [
             { id: 'gen-15-1', type: 'pregunta_profunda', questionText: 'En una visión, ¿qué le dijo Dios a Abram que sería su galardón?', options: ['Riquezas sin fin', 'Un gran ejército', 'Dios mismo', 'Sabiduría infinita'], correctAnswer: 'Dios mismo', verse: 'Génesis 15:1' },
             { id: 'gen-15-2', type: 'pregunta_profunda', questionText: '¿De quién se quejó Abram que sería su heredero, ya que no tenía hijos?', options: ['Lot, su sobrino', 'Uno de sus siervos', 'Eliezer de Damasco', 'El rey de Salem'], correctAnswer: 'Eliezer de Damasco', verse: 'Génesis 15:2-3' },
             { id: 'gen-15-3', type: 'pregunta_profunda', questionText: '¿A qué comparó Dios la descendencia que tendría Abram?', options: ['Las arenas del mar', 'Las estrellas del cielo', 'Las hojas de los árboles', 'Los peces del océano'], correctAnswer: 'Las estrellas del cielo', verse: 'Génesis 15:5' },
             { id: 'gen-15-4', type: 'completar_versiculo', questionText: 'Y ______ a Jehová, y le fue contado por justicia.', options: ['temió', 'oró', 'creyó', 'obedeció'], correctAnswer: 'creyó', verse: 'Génesis 15:6' },
             { id: 'gen-15-5', type: 'pregunta_profunda', questionText: '¿Qué animales dividió Abram por la mitad para el pacto con Dios?', options: ['Dos corderos y dos palomas', 'Una becerra, una cabra y un carnero', 'Siete ovejas', 'Un buey y un carnero'], correctAnswer: 'Una becerra, una cabra y un carnero', verse: 'Génesis 15:9' },
             { id: 'gen-15-6', type: 'pregunta_profunda', questionText: '¿Qué símbolos de la presencia de Dios pasaron por en medio de los animales divididos?', options: ['Un viento recio y un fuego', 'Una nube y una columna de fuego', 'Un horno humeando y una antorcha de fuego', 'Un carro de fuego y caballos de fuego'], correctAnswer: 'Un horno humeando y una antorcha de fuego', verse: 'Génesis 15:17' },
             { id: 'gen-15-7', type: 'pregunta_profunda', questionText: '¿Cuánto tiempo le dijo Dios a Abram que su descendencia sería esclava en tierra ajena?', options: ['100 años', '250 años', '400 años', '700 años'], correctAnswer: '400 años', verse: 'Génesis 15:13' },
          ]
        },
        {
          id: 18,
          title: 'Capítulo 18-19: Sodoma y Gomorra',
          description: 'La intercesión de Abraham y la destrucción de las ciudades.',
          isTestChapter: false,
          activities: [
             { id: 'gen-18-1', type: 'pregunta_profunda', questionText: '¿Cuántos varones se le aparecieron a Abraham en el encinar de Mamre?', options: ['Uno', 'Dos', 'Tres', 'Siete'], correctAnswer: 'Tres', verse: 'Génesis 18:2' },
             { id: 'gen-18-2', type: 'pregunta_profunda', questionText: '¿Qué promesa le hicieron a Sara que la hizo reír?', options: ['Que sería reina', 'Que tendría un hijo en su vejez', 'Que viviría 200 años', 'Que su esposo sería muy rico'], correctAnswer: 'Que tendría un hijo en su vejez', verse: 'Génesis 18:10-12' },
             { id: 'gen-18-3', type: 'pregunta_profunda', questionText: 'Abraham intercedió por Sodoma. ¿Cuál fue el número más bajo de justos por el que pidió a Dios que perdonara la ciudad?', options: ['50', '30', '20', '10'], correctAnswer: '10', verse: 'Génesis 18:32' },
             { id: 'gen-18-4', type: 'pregunta_profunda', questionText: '¿Qué hicieron los hombres de Sodoma cuando los dos ángeles visitaron a Lot?', options: ['Les ofrecieron regalos', 'Rodearon la casa para abusar de ellos', 'Les pidieron que se fueran', 'Les contaron historias'], correctAnswer: 'Rodearon la casa para abusar de ellos', verse: 'Génesis 19:4-5' },
             { id: 'gen-18-5', type: 'pregunta_profunda', questionText: '¿Cómo escaparon Lot y su familia antes de la destrucción?', options: ['Corriendo muy rápido', 'Los ángeles los tomaron de la mano y los sacaron', 'Encontraron un pasadizo secreto', 'Se escondieron en un pozo'], correctAnswer: 'Los ángeles los tomaron de la mano y los sacaron', verse: 'Génesis 19:16' },
             { id: 'gen-18-6', type: 'pregunta_profunda', questionText: '¿Qué le pasó a la esposa de Lot cuando miró hacia atrás?', options: ['Se convirtió en una estatua de sal', 'Se quedó ciega', 'Tropezó y cayó', 'Fue llevada por un torbellino'], correctAnswer: 'Se convirtió en una estatua de sal', verse: 'Génesis 19:26' },
             { id: 'gen-18-7', type: 'completar_versiculo', questionText: 'Entonces Jehová hizo llover sobre Sodoma y sobre Gomorra ______ y fuego de parte de Jehová desde los cielos.', options: ['granizo', 'azufre', 'agua', 'piedras'], correctAnswer: 'azufre', verse: 'Génesis 19:24' },
          ]
        },
        {
          id: 22,
          title: 'Capítulo 22: La Prueba de Abraham',
          description: 'Dios prueba la fe de Abraham pidiéndole a su hijo Isaac.',
          isTestChapter: false,
          activities: [
            { id: 'gen-22-1', type: 'pregunta_profunda', questionText: '¿Qué le pidió Dios a Abraham que hiciera con su hijo Isaac?', options: ['Que lo enviara a Egipto', 'Que lo enseñara a ser pastor', 'Que lo ofreciera en holocausto', 'Que le construyera un altar'], correctAnswer: 'Que lo ofreciera en holocausto', verse: 'Génesis 22:2' },
            { id: 'gen-22-2', type: 'pregunta_profunda', questionText: '¿A qué lugar le dijo Dios a Abraham que fuera para el sacrificio?', options: ['Monte Sinaí', 'Monte Horeb', 'La tierra de Moriah', 'El desierto de Beerseba'], correctAnswer: 'La tierra de Moriah', verse: 'Génesis 22:2' },
            { id: 'gen-22-3', type: 'pregunta_profunda', questionText: '¿Qué pregunta le hizo Isaac a su padre Abraham en el camino?', options: ['¿Falta mucho para llegar?', '¿Por qué vamos tan lejos?', '¿Dónde está el cordero para el holocausto?', '¿Puedo llevar la leña?'], correctAnswer: '¿Dónde está el cordero para el holocausto?', verse: 'Génesis 22:7' },
            { id: 'gen-22-4', type: 'pregunta_profunda', questionText: '¿Qué respondió Abraham a la pregunta de Isaac?', options: ['"Tú eres el cordero, hijo mío"', '"Dios proveerá de cordero para el holocausto, hijo mío"', '"Debemos encontrar uno en el monte"', '"No te preocupes por eso ahora"'], correctAnswer: '"Dios proveerá de cordero para el holocausto, hijo mío"', verse: 'Génesis 22:8' },
            { id: 'gen-22-5', type: 'pregunta_profunda', questionText: '¿Quién detuvo a Abraham justo cuando iba a sacrificar a Isaac?', options: ['Un siervo', 'Isaac mismo', 'El ángel de Jehová', 'Una voz del cielo sin identificar'], correctAnswer: 'El ángel de Jehová', verse: 'Génesis 22:11-12' },
            { id: 'gen-22-6', type: 'pregunta_profunda', questionText: '¿Qué proveyó Dios para el sacrificio en lugar de Isaac?', options: ['Una paloma', 'Un cordero sin mancha', 'Un carnero trabado en un zarzal', 'Nada, solo pidió la obediencia'], correctAnswer: 'Un carnero trabado en un zarzal', verse: 'Génesis 22:13' },
            { id: 'gen-22-7', type: 'completar_versiculo', questionText: 'Y llamó Abraham el nombre de aquel lugar, Jehová ______.', options: ['Jireh (proveerá)', 'Nissi (es mi bandera)', 'Shalom (es paz)', 'Rafah (sanador)'], correctAnswer: 'Jireh (proveerá)', verse: 'Génesis 22:14' },
          ]
        },
        {
          id: 23,
          title: 'Prueba: El Padre de la Fe',
          description: 'Demuestra tu dominio sobre la vida de Abraham.',
          isTestChapter: true,
          activities: [
             { id: 'gen-test-3-1', type: 'pregunta_profunda', questionText: '¿Qué pariente de Abraham se separó de él por una contienda entre sus pastores?', options: ['Eliezer', 'Nacor', 'Lot', 'Taré'], correctAnswer: 'Lot', verse: 'Génesis 13:7-9' },
             { id: 'gen-test-3-2', type: 'pregunta_profunda', questionText: '¿Quién era Melquisedec, quien bendijo a Abram?', options: ['Rey de Egipto y sacerdote', 'Rey de Salem y sacerdote del Dios Altísimo', 'Un profeta del desierto', 'El padre de Lot'], correctAnswer: 'Rey de Salem y sacerdote del Dios Altísimo', verse: 'Génesis 14:18' },
             { id: 'gen-test-3-3', type: 'pregunta_profunda', questionText: '¿Cómo se llamaba la sierva egipcia de Sarai que le dio un hijo a Abram?', options: ['Cetura', 'Milca', 'Rebeca', 'Agar'], correctAnswer: 'Agar', verse: 'Génesis 16:1' },
             { id: 'gen-test-3-4', type: 'pregunta_profunda', questionText: '¿Cómo se llamó el hijo de Abram y Agar?', options: ['Isaac', 'Ismael', 'Zimram', 'Medan'], correctAnswer: 'Ismael', verse: 'Génesis 16:15' },
             { id: 'gen-test-3-5', type: 'pregunta_profunda', questionText: '¿A qué nombres cambió Dios los nombres de Abram y Sarai?', options: ['Adán y Eva', 'Israel y Lea', 'Abraham y Sara', 'Moisés y Séfora'], correctAnswer: 'Abraham y Sara', verse: 'Génesis 17:5, 15' },
             { id: 'gen-test-3-6', type: 'pregunta_profunda', questionText: '¿Cuál era la señal del pacto que Dios estableció con Abraham y su descendencia?', options: ['El bautismo', 'El diezmo', 'El arcoíris', 'La circuncisión'], correctAnswer: 'La circuncisión', verse: 'Génesis 17:10-11' },
             { id: 'gen-test-3-7', type: 'pregunta_profunda', questionText: '¿Cuántos años tenía Abraham cuando nació Isaac?', options: ['75', '86', '99', '100'], correctAnswer: '100', verse: 'Génesis 21:5' },
          ]
        },
      ]
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private readonly progressKey = 'campaignProgress';
  private readonly _genesisBook = signal<BibleBook>(GENESIS_BOOK_DATA);
  
  readonly progress = signal<UserCampaignProgress>(this.loadProgress());

  public readonly genesisBook = this._genesisBook.asReadonly();

  constructor() {
    effect(() => {
      this.saveProgress(this.progress());
    });
  }

  private loadProgress(): UserCampaignProgress {
    try {
      const stored = localStorage.getItem(this.progressKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading campaign progress from localStorage', error);
    }
    return { completedActivities: {} };
  }

  private saveProgress(progress: UserCampaignProgress): void {
    try {
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving campaign progress to localStorage', error);
    }
  }
  
  getChapterById(bookId: string, chapterId: number): BibleChapter | undefined {
    if (bookId === 'genesis') {
      for (const stage of this.genesisBook().stages) {
        const chapter = stage.chapters.find(c => c.id === chapterId);
        if (chapter) {
          return chapter;
        }
      }
    }
    return undefined;
  }

  completeActivity(bookId: string, chapterId: number, activityId: string) {
    this.progress.update(current => {
      const newProgress = { ...current };
      if (!newProgress.completedActivities[bookId]) {
        newProgress.completedActivities[bookId] = {};
      }
      if (!newProgress.completedActivities[bookId][chapterId]) {
        newProgress.completedActivities[bookId][chapterId] = [];
      }
      
      if (!newProgress.completedActivities[bookId][chapterId].includes(activityId)) {
        newProgress.completedActivities[bookId][chapterId].push(activityId);
      }
      return newProgress;
    });
  }
}
