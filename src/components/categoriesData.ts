export interface ReadingCategory {
  id: string;
  name: string;
  description: string;
}

export const READING_CATEGORIES: ReadingCategory[] = [
  {
    id: 'personas',
    name: 'Personas',
    description: 'Artistas, curadores, gestores, docentes, técnicos.',
  },
  {
    id: 'practicas',
    name: 'Prácticas',
    description: 'Pintura, dibujo, fotografía, performance, instalación, sonido, audiovisual, etc.',
  },
  {
    id: 'materiales',
    name: 'Materiales / medios',
    description: 'Óleo, textil, metal, software, video, archivo, cuerpo, luz.',
  },
  {
    id: 'conceptos',
    name: 'Conceptos',
    description: 'Territorio, cuerpo, memoria, identidad, naturaleza, género, archivo, tecnología.',
  },
  {
    id: 'instituciones',
    name: 'Instituciones',
    description: 'Universidades, museos, galerías, fundaciones, espacios culturales.',
  },
  {
    id: 'residencias',
    name: 'Residencias / becas',
    description: 'Programas que conectan personas e instituciones.',
  },
  {
    id: 'exhibiciones',
    name: 'Exhibiciones / proyectos',
    description: 'Muestras, festivales, salones, encuentros.',
  },
  {
    id: 'geografias',
    name: 'Geografías',
    description: 'Córdoba, Buenos Aires, Rosario, Mendoza, internacional, etc.',
  },
  {
    id: 'formacion',
    name: 'Formación',
    description: 'Dónde estudiaron, docentes, clínicas y programas.',
  },
  {
    id: 'circulacion',
    name: 'Circulación',
    description: 'Exposiciones, publicaciones, premios, residencias y colaboraciones.',
  },
];
