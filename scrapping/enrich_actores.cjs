const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/actores.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const artistUpdates = {
  'art-ailen-alcaraz': {
    biografia: 'Artista visual y comunicadora vinculada a la Facultad de Artes y Diseño de la Universidad Nacional de Cuyo (UNCuyo), con foco en proyectos de cartelería contrapublicitaria, medios de comunicación y diversidad.',
    practicas: ['gráfica', 'comunicación', 'cartelería', 'prácticas interdisciplinarias'],
    materiales: ['cartelería'],
    conceptos: ['diversidad', 'medios', 'comunicación'],
    instituciones: ['UNCuyo / FAD'],
    formacion: ['UNCuyo / FAD'],
    geografias: ['Mendoza']
  },
  'art-ariana-beilis': {
    biografia: 'Artista visual de Rosario. Participó en el 74.º y 78.º Salón Nacional de Rosario (con obras como "¿Cuánto vacío puede llenar un mueble?" y "Ducha" de la serie "Gris todo") y en el proyecto "Desde Adentro 2020" de la Biblioteca Pedagógica Eudoro Díaz, explorando el vacío, la intimidad y la vida cotidiana.',
    practicas: ['pintura', 'objeto', 'dibujo', 'instalación', 'espacialidad'],
    materiales: ['óleo', 'lienzo', 'objeto'],
    conceptos: ['vacío', 'intimidad', 'cuerpo', 'vida cotidiana', 'memoria'],
    instituciones: ['Museo Castagnino+macro', 'Salón Nacional de Rosario', 'Biblioteca Pedagógica Eudoro Díaz'],
    exhibiciones: ['74.º Salón Nacional de Rosario', '78.º Salón Nacional de Rosario', 'Desde Adentro 2020'],
    geografias: ['Rosario', 'Santa Fe'],
    circulacion: ['Salones nacionales']
  },
  'art-ayelen-mohaded': {
    biografia: 'Nació en 1985 en Argentina. Licenciada en Diseño Textil por la Universidad de Palermo y Especialista en Prácticas Artísticas Contemporáneas por la UNC. Trabaja con pintura, performance y joyería, vinculando estas disciplinas con el cuerpo, la fragilidad y la superficie material. Realizó residencia en Studio Kura (Japón) y ha expuesto en Córdoba, Villa María y Londres.',
    anio_nacimiento: 1985,
    practicas: ['pintura', 'performance', 'joyería', 'diseño textil'],
    materiales: ['textil', 'joyería', 'piel'],
    conceptos: ['cuerpo', 'fragilidad', 'sombra', 'materialidad', 'efímero', 'persistente', 'melancolía', 'euforia', 'piel', 'superficie'],
    residencias: ['Studio Kura (Japón)'],
    instituciones: ['UNC', 'Universidad de Palermo', 'Studio Kura', 'Central Saint Martins', 'Museo de las Mujeres', 'Museo Bonfiglioli'],
    galerias: ['Galería Satélite', 'Galería Caelum'],
    geografias: ['Córdoba', 'Villa María', 'Japón', 'Londres'],
    formacion: ['Universidad de Palermo', 'UNC', 'Central Saint Martins'],
    circulacion: ['Córdoba', 'Londres', 'Japón']
  },
  'art-belen-ghiso': {
    biografia: 'Artista visual activa en la plataforma VAPOR. Perfil en proceso de relevamiento y documentación biográfica.',
    geografias: ['Argentina']
  },
  'art-chebo-roitter-pavez': {
    biografia: 'Sebastián "Chebo" Roitter Pavez es artista, diseñador gráfico y editorial, editor, investigador, docente, animador y selector musical. Su trabajo revisa los huecos de las narrativas históricas dominantes manipulando imágenes y documentos de dominio público, tradiciones apócrifas y humor.',
    personas: ['artista', 'diseñador gráfico', 'editor', 'investigador', 'docente', 'animador', 'selector musical'],
    practicas: ['diseño gráfico', 'edición', 'animación', 'investigación', 'apropiación'],
    materiales: ['archivo', 'documento', 'texto', 'imagen'],
    conceptos: ['archivo', 'apropiación', 'documento', 'texto', 'imagen', 'humor', 'historia', 'ficción', 'falsificación', 'apócrifo', 'patrimonio cultural', 'narrativas históricas', 'espacio público'],
    geografias: ['Córdoba', 'Buenos Aires']
  },
  'art-constanza-chiappini': {
    biografia: 'Nació en Trelew, Chubut, en 1988. Licenciada en Pintura por la UNC (egresada en 2014). Desarrolló gran parte de su carrera en Córdoba y vive y trabaja en Buenos Aires. Seleccionada dos veces para la Beca Creación del FNA; participó en BIENALSUR, Casa del Bicentenario y fue directora de Pinball Galería de Arte.',
    anio_nacimiento: 1988,
    practicas: ['pintura', 'gestión cultural', 'curaduría'],
    materiales: ['óleo', 'imagen', 'archivo', 'lienzo'],
    conceptos: ['pintura', 'imagen', 'memoria', 'archivo', 'afectos', 'identidad', 'historia reciente', 'cultura popular', 'fútbol', 'territorio'],
    instituciones: ['Museo Jesuítico Nacional Estancia Jesús María', 'Casa Nacional del Bicentenario', 'UNC', 'Fundación El Mirador', 'FNA'],
    galerias: ['Pinball Galería de Arte'],
    coleccionistas: ['Fondo Nacional de las Artes (FNA)', 'Beca Creación FNA'],
    exhibiciones: ['BIENALSUR', 'Casa Nacional del Bicentenario'],
    formacion: ['UNC'],
    geografias: ['Trelew', 'Chubut', 'Córdoba', 'Buenos Aires']
  },
  'art-ezequiel-lovrovich': {
    biografia: 'Artista e investigador en artes visuales de la UNC (becario 2025/26). Su producción se sitúa en la intersección entre arte, ciencia, química y naturaleza. Su procedimiento central es la cianotipia con soluciones químicas, luz solar y agua para registrar huellas, sombras y cuerpos sobre textiles y papel. Su trabajo circuló por Argentina, España y Noruega.',
    practicas: ['cianotipia', 'fotografía', 'investigación artística', 'proceso'],
    materiales: ['química', 'luz solar', 'agua', 'textil', 'papel'],
    conceptos: ['cianotipia', 'fotografía', 'química', 'luz solar', 'agua', 'sombra', 'huella', 'cuerpo', 'textil', 'naturaleza', 'semiótica', 'investigación artística', 'proceso'],
    formacion: ['UNC'],
    instituciones: ['UNC'],
    coleccionistas: ['Beca de investigación UNC'],
    geografias: ['Córdoba', 'España', 'Noruega'],
    circulacion: ['Argentina', 'España', 'Noruega']
  },
  'art-facundo-diaz': {
    biografia: 'Nació en Mendoza en 1985. Artista y gestor cultural con una concepción nómade de la producción en formatos pequeños y transportables. Su práctica cruza dibujo, pintura, poesía, paisaje de montaña y vulcanología, sueños y criptozoología.',
    anio_nacimiento: 1985,
    personas: ['artista', 'gestor cultural'],
    practicas: ['dibujo', 'pintura', 'poesía', 'escritura', 'fotografía', 'video', 'performance'],
    materiales: ['papel', 'tinta', 'objeto'],
    conceptos: ['paisaje', 'montaña', 'volcán', 'fuego', 'noche', 'naturaleza', 'geografía', 'criptozoología', 'nomadismo', 'sueños'],
    geografias: ['Mendoza'],
    circulacion: ['Mendoza', 'Circuitos independientes']
  },
  'art-franco-fasoli-jaz': {
    biografia: 'Nació en Buenos Aires en 1981; vive y trabaja entre Barcelona y Buenos Aires. Formado en cerámica y en el ISA del Teatro Colón. Pionero del graffiti y muralismo en el espacio público argentino a fines de los 90. Trabaja con pintura, collage, bronce, papel y escultura monumental, indagando en subculturas, identidades colectivas, rituales latinoamericanos y tensiones sociales.',
    anio_nacimiento: 1981,
    practicas: ['muralismo', 'graffiti', 'pintura', 'collage', 'escultura', 'escenografía'],
    materiales: ['bronce', 'papel', 'cerámica', 'mural', 'óleo'],
    conceptos: ['espacio público', 'arquitectura', 'identidad', 'conflicto', 'subculturas', 'América Latina', 'ritual', 'historia argentina', 'escala', 'materialidad'],
    instituciones: ['Teatro Colón / ISA', 'Museo de Arte Moderno (Museo Moderno)'],
    coleccionistas: ['Fundación Konex', 'Museo Moderno (Adquisición patrimonial)'],
    formacion: ['Teatro Colón / ISA'],
    geografias: ['Buenos Aires', 'Barcelona', 'América Latina', 'Europa'],
    circulacion: ['Buenos Aires', 'Barcelona', 'Internacional']
  },
  'art-guillermo-mena': {
    biografia: 'Nació en Los Cóndores, Córdoba, en 1986. Técnico en Artes Visuales y diseñador gráfico, radicado en Buenos Aires. Su procedimiento central consiste en desgastar carbón contra muros para luego transferir sus huellas al papel, articulando acción espacial y registro conservable, además de animación, video e instalaciones site-specific. Ha realizado residencias en Canadá, Islandia, Italia, España y Uruguay.',
    anio_nacimiento: 1986,
    practicas: ['dibujo', 'instalación', 'site-specific', 'performance', 'animación', 'video', 'fotografía', 'collage'],
    materiales: ['carbón', 'muro', 'papel'],
    conceptos: ['paisaje', 'espacio', 'huella', 'desaparición', 'memoria', 'movimiento', 'acción corporal'],
    residencias: ['Canadá', 'Islandia', 'Italia', 'España', 'Uruguay'],
    formacion: ['UNC'],
    geografias: ['Los Cóndores', 'Córdoba', 'Buenos Aires', 'Canadá', 'Islandia', 'Italia', 'España', 'Uruguay'],
    circulacion: ['Buenos Aires', 'Córdoba', 'Internacional']
  },
  'art-juan-jesus-conde': {
    biografia: 'Artista visual y docente de escultura en metal. En 2026 figura como docente en el Museo Puerto de la Memoria de Paraná, trabajando técnicas metálicas para producir piezas funcionales y expresivas, además de escribir sobre territorio, paisaje y geografía entrerriana.',
    personas: ['artista', 'docente', 'escritor'],
    practicas: ['escultura', 'escritura'],
    materiales: ['metal', 'objeto'],
    conceptos: ['escultura', 'metal', 'territorio', 'paisaje', 'geografía'],
    instituciones: ['Museo Puerto de la Memoria'],
    geografias: ['Paraná', 'Entre Ríos']
  },
  'art-juan-tarraf': {
    biografia: 'Nació en Buenos Aires en 1995. Licenciado en Artes Visuales (Pintura) por la UNA e Instituto Vocacional de Arte. Realizó clínicas con Carlos Bissolino y Ernesto Ballesteros. Participó en Taller Compartido (Galería Crudo), LAR y Neoinformalismo Zen (2026), trabajando una pintura abstracta al óleo ligada al informalismo, la intuición y la espiritualidad.',
    anio_nacimiento: 1995,
    practicas: ['pintura', 'abstracción'],
    materiales: ['óleo', 'materia', 'lienzo'],
    conceptos: ['abstracción', 'materia', 'intuición', 'espiritualidad', 'informalismo', 'zen', 'cuerpo', 'ritmo'],
    instituciones: ['UNA', 'Instituto Vocacional de Arte', 'Universidad Torcuato Di Tella (UTDT)', 'Universidad Nacional de La Plata (UNLP)', 'Fundación El Mirador'],
    galerias: ['Galería Crudo'],
    residencias: ['LAR (Local de Artes Recientes)', 'Taller Compartido'],
    exhibiciones: ['Neoinformalismo Zen (2026)', 'Artistas x Artistas'],
    formacion: ['UNA', 'Instituto Vocacional de Arte'],
    geografias: ['Buenos Aires']
  },
  'art-julia-rossetti-latigx': {
    biografia: 'Nacida en Corrientes en 1986. Licenciada en Artes Visuales, diseñadora gráfica y especialista en arte sonoro. Bajo el nombre artístico Látigx crea música experimental, paisajes sonoros, arte MIDI, performance, radio e instalaciones. Su trabajo aborda la cosmogonía guaraní, folklore del Nordeste, territorio de frontera y rituales, circulando por América Latina, Europa y Asia.',
    anio_nacimiento: 1986,
    practicas: ['arte sonoro', 'música experimental', 'radio', 'performance', 'instalación', 'audiovisual', 'dibujo', 'ilustración', 'bordado'],
    materiales: ['MIDI', 'software', 'bordado', 'paisaje sonoro'],
    conceptos: ['paisaje sonoro', 'archivo', 'territorio', 'frontera', 'cultura guaraní', 'memoria', 'ritual', 'sincretismo', 'folklore', 'escucha'],
    residencias: ['Curadora', 'Manta', 'Barda del Desierto', 'Tsonami', 'Casa Belgrado'],
    formacion: ['UNC'],
    instituciones: ['UNC'],
    geografias: ['Corrientes', 'Córdoba', 'Chile', 'América Latina', 'Europa', 'Asia'],
    circulacion: ['América Latina', 'Europa', 'Asia']
  },
  'art-leandro-fernandez': {
    biografia: 'Artista visual nacido en Concarán, San Luis, formado en Córdoba y radicado en San Luis. Su práctica cruza escultura, fotografía, objetos, pintura y videoarte a partir de su relación íntima con el entorno natural, la poesía y la filosofía, indagando en ciclos, transformación y retorno.',
    practicas: ['escultura', 'objeto', 'fotografía', 'pintura', 'video', 'interdisciplinariedad'],
    materiales: ['objeto', 'fotografía', 'video'],
    conceptos: ['naturaleza', 'paisaje', 'ciclos', 'transformación', 'cambio', 'retorno', 'intuición', 'territorio'],
    formacion: ['Córdoba'],
    geografias: ['Concarán', 'San Luis', 'Córdoba']
  },
  'art-luna-sudaca': {
    biografia: 'Nació en Buenos Aires en 1995/1996. Formada en el Instituto Vocacional de Arte Labardén y la Escuela de Bellas Artes Manuel Belgrano; desde 2022 vinculada a MUNAR. Su obra está fuertemente ligada a la noche del conurbano (particularmente Liniers), explorando sexualidad, intimidad, fantasía y clandestinidad mediante telas sintéticas y pintura.',
    anio_nacimiento: 1995,
    practicas: ['pintura', 'dibujo'],
    materiales: ['tela', 'telas sintéticas', 'pintura'],
    conceptos: ['territorio', 'noche', 'sexualidad', 'intimidad', 'periferia', 'conurbano', 'Liniers', 'imaginario barrial', 'fantasía', 'clandestinidad'],
    residencias: ['MUNAR'],
    instituciones: ['MUNAR', 'Instituto Vocacional de Arte Labardén', 'Escuela Manuel Belgrano'],
    formacion: ['Instituto Vocacional de Arte Labardén', 'Escuela Manuel Belgrano'],
    geografias: ['Buenos Aires', 'Liniers', 'Conurbano']
  },
  'art-maria-arrastoa': {
    biografia: 'Nacida en Buenos Aires en 1994, radicada en Barcelona. Profesional del montaje cinematográfico y la postproducción audiovisual desde 2014. Ha trabajado en cine y televisión en producciones reconocidas como El Ángel, La Odisea de los Giles, El Reino, El Fin del Amor, Clementina y La Calle de los Pianistas.',
    anio_nacimiento: 1994,
    personas: ['profesional audiovisual', 'montajista', 'editora'],
    practicas: ['montaje', 'edición audiovisual', 'postproducción', 'VFX', 'color grading', 'motion graphics', 'diseño gráfico', 'cine', 'producción audiovisual'],
    materiales: ['video', 'imagen digital', 'software'],
    conceptos: ['cine', 'documental', 'ficción', 'televisión', 'producción audiovisual', 'industria audiovisual'],
    instituciones: ['industria audiovisual'],
    geografias: ['Buenos Aires', 'Barcelona']
  },
  'art-martin-sensi': {
    biografia: 'Nació en Coronel Pringles en 1989. Licenciado en Grabado y Arte Impreso por la Facultad de Bellas Artes de la UNLP (La Plata). Organizador de "Tranza Encuentro Federal de Gráfica" y docente en procedimientos visuales. Construye instalaciones y escenarios ficcionales a partir de fragmentos, ruinas y objetos del entorno cotidiano.',
    anio_nacimiento: 1989,
    personas: ['artista', 'organizador', 'docente'],
    practicas: ['grabado', 'gráfica', 'arte impreso', 'instalación'],
    materiales: ['papel', 'tinta', 'objeto', 'impresión'],
    conceptos: ['fragmento', 'ruina', 'objeto', 'ficción', 'extrañamiento', 'paisaje cotidiano'],
    exhibiciones: ['Tranza Encuentro Federal de Gráfica', 'Centro Cultural Recoleta', 'Festival Ctrl P', 'Presión Festival de Grabado'],
    instituciones: ['UNLP', 'Centro de Arte UNLP', 'Centro Cultural Recoleta'],
    formacion: ['UNLP'],
    geografias: ['Coronel Pringles', 'La Plata', 'Buenos Aires']
  },
  'art-mateo-valbuena-gonzalez': {
    biografia: 'Pintor que investiga la abstracción, el lenguaje mudo de la naturaleza y la intuición matérica sobre óleo y lienzo. Participó en la exposición Neoinformalismo Zen (2026) y en programas de la Universidad Torcuato Di Tella.',
    practicas: ['pintura', 'abstracción'],
    materiales: ['óleo', 'lienzo', 'materia'],
    conceptos: ['abstracción', 'naturaleza', 'materia', 'intuición', 'informalismo', 'zen', 'paisaje'],
    exhibiciones: ['Neoinformalismo Zen (2026)'],
    instituciones: ['Universidad Torcuato Di Tella (UTDT)', 'Centro de Arte UNLP'],
    formacion: ['UTDT'],
    geografias: ['Buenos Aires', 'La Plata']
  },
  'art-mauricio-chiappini': {
    biografia: 'Fotógrafo y docente de fotografía de retrato radicado en Córdoba. Su actividad profesional y formativa se concentra en técnicas de iluminación, encuadre, contexto escénico y dirección de personas.',
    personas: ['fotógrafo', 'docente'],
    practicas: ['fotografía', 'retrato'],
    materiales: ['iluminación', 'fotografía'],
    conceptos: ['retrato', 'iluminación', 'encuadre', 'contexto', 'dirección de personas', 'imagen fotográfica'],
    geografias: ['Córdoba']
  },
  'art-milena-leczycki': {
    biografia: 'Estudiante de artes visuales e ilustradora, creadora del proyecto editorial Milesbozos. Desarrolla dibujos, calcos, postales y fanzines que abordan el género fantástico, criaturas, infancia, pérdida, amistad e intimidad. Participante del Premio Prilidiano Pueyrredón 2025.',
    personas: ['artista', 'ilustradora', 'estudiante'],
    practicas: ['dibujo', 'ilustración', 'publicaciones', 'fanzine'],
    materiales: ['calcos', 'postales', 'fanzine', 'papel'],
    conceptos: ['fantasía', 'monstruos', 'criaturas', 'infancia', 'intimidad', 'nostalgia', 'cuerpo'],
    exhibiciones: ['Cómo atrapar una estrella fugaz', 'Premio Prilidiano Pueyrredón 2025', 'Casa Nacional del Bicentenario'],
    instituciones: ['Casa Nacional del Bicentenario'],
    geografias: ['Buenos Aires']
  },
  'art-mora-martinez-broder': {
    biografia: 'Artista visual e investigadora vinculada a la Facultad de Artes de la UNC en Córdoba, participando en proyectos de investigación académica sobre arte contemporáneo, géneros, sexualidades y colectivos LGBTIQ+.',
    personas: ['artista', 'investigadora'],
    practicas: ['artes visuales', 'investigación artística'],
    conceptos: ['artes visuales', 'investigación', 'género y diversidad', 'LGBTIQ+', 'identidad'],
    instituciones: ['UNC'],
    coleccionistas: ['Beca de investigación UNC'],
    formacion: ['UNC'],
    geografias: ['Córdoba']
  },
  'art-samantha-ferro': {
    biografia: 'Nació en Génova (Italia) y desarrolló su formación artística en Córdoba. Licenciada en Artes Visuales con orientación en Escultura por la UNC. Trabaja sobre el cuerpo como territorio de construcción de identidades y prácticas de sujeción, empleando tela, tafeta, hierro e imanes. Participó en el Programa de Artistas UTDT, Proyecto Yungas, R.A.R.O. y Marco Arte Foco.',
    practicas: ['escultura', 'instalación', 'textil', 'fotografía'],
    materiales: ['tela', 'tafeta', 'hierro', 'imanes'],
    conceptos: ['cuerpo', 'vulnerabilidad', 'identidad', 'género', 'sujeción', 'prácticas naturalizadas'],
    residencias: ['Programa de Artistas UTDT', 'R.A.R.O.', 'Marco Arte Foco', 'Proyecto Yungas', 'Encontro de Artistas Novos'],
    instituciones: ['UNC', 'UTDT', 'FAUD'],
    formacion: ['UNC', 'UTDT'],
    geografias: ['Génova', 'Córdoba', 'Buenos Aires']
  },
  'art-siu-lizaso': {
    biografia: 'Licenciada en Pintura por la UNC y especializada en Gestión Cultural por la Universidad Blas Pascal. Gestora cultural, curadora y productora artística; fue coordinadora de Artes Visuales de la Secretaría de Cultura de Córdoba, coordinadora de Mercado de Arte Contemporáneo y responsable de programas como La Sala Que Habito. Integra Capital Creativo.',
    personas: ['artista', 'gestora cultural', 'curadora', 'productora'],
    practicas: ['pintura', 'gestión cultural', 'curaduría', 'producción', 'políticas culturales'],
    conceptos: ['gestión cultural', 'curaduría', 'políticas culturales', 'mercado de arte', 'espacio público', 'instituciones culturales'],
    instituciones: ['UNC', 'Universidad Blas Pascal', 'Secretaría de Cultura Córdoba', 'Mercado de Arte Contemporáneo', 'Capital Creativo'],
    galerias: ['Mercado de Arte Contemporáneo'],
    formacion: ['UNC', 'Universidad Blas Pascal'],
    geografias: ['Córdoba']
  },
  'art-soledad-manrique-goldsack': {
    biografia: 'Fotógrafa, iluminadora, montajista y técnica de exposiciones en Buenos Aires. Integra el equipo de producción del Museo de Arte Moderno de Buenos Aires y ha realizado tareas de montaje, iluminación y museografía para el Museo Moderno, Instituto Di Tella, arteBA y galerías privadas.',
    personas: ['fotógrafa', 'iluminadora', 'montajista', 'técnica'],
    practicas: ['fotografía', 'iluminación', 'montaje', 'producción', 'museografía', 'técnica de exposiciones'],
    materiales: ['luz', 'fotografía', 'espacio expositivo'],
    conceptos: ['museografía', 'espacio', 'iluminación', 'exposiciones', 'montaje', 'instituciones'],
    instituciones: ['Museo de Arte Moderno (Museo Moderno)', 'Instituto Di Tella', 'arteBA'],
    galerias: ['arteBA'],
    geografias: ['Buenos Aires']
  }
};

const updated = data.map(item => {
  if (artistUpdates[item.id]) {
    const patch = artistUpdates[item.id];
    return {
      ...item,
      ...patch,
      personas: Array.from(new Set([...(item.personas || []), ...(patch.personas || [])])),
      practicas: Array.from(new Set([...(item.practicas || []), ...(patch.practicas || [])])),
      materiales: Array.from(new Set([...(item.materiales || []), ...(patch.materiales || [])])),
      conceptos: Array.from(new Set([...(item.conceptos || []), ...(patch.conceptos || [])])),
      instituciones: Array.from(new Set([...(item.instituciones || []), ...(patch.instituciones || [])])),
      residencias: Array.from(new Set([...(item.residencias || []), ...(patch.residencias || [])])),
      exhibiciones: Array.from(new Set([...(item.exhibiciones || []), ...(patch.exhibiciones || [])])),
      geografias: Array.from(new Set([...(item.geografias || []), ...(patch.geografias || [])])),
      formacion: Array.from(new Set([...(item.formacion || []), ...(patch.formacion || [])])),
      circulacion: Array.from(new Set([...(item.circulacion || []), ...(patch.circulacion || [])])),
      galerias: Array.from(new Set([...(item.galerias || []), ...(patch.galerias || [])])),
      curadores: Array.from(new Set([...(item.curadores || []), ...(patch.curadores || [])])),
      coleccionistas: Array.from(new Set([...(item.coleccionistas || []), ...(patch.coleccionistas || [])]))
    };
  }
  return item;
});

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
console.log('Successfully enriched all 24 artists in actores.json');
