export interface ReadingCategory {
  id: string;
  name: string;
  description: string;
}

export const READING_CATEGORIES: ReadingCategory[] = [
  {
    id: 'materiales',
    name: 'Trabaja con',
    description: 'Materiales y medios utilizados en la producción de obra.',
  },
  {
    id: 'practicas',
    name: 'Produce',
    description: 'Disciplinas y lenguajes artísticos desarrollados.',
  },
  {
    id: 'conceptos',
    name: 'Indaga en',
    description: 'Ejes temáticos, núcleos de investigación y preguntas teóricas.',
  },
  {
    id: 'galerias',
    name: 'Expone en galerías',
    description: 'Galerías comerciales y espacios de mercado vinculados.',
  },
  {
    id: 'instituciones',
    name: 'Vinculado a instituciones',
    description: 'Museos, centros culturales y universidades asociadas.',
  },
  {
    id: 'curadores',
    name: 'Articulado con curadores y críticos',
    description: 'Curadores, teóricos y críticos con los que ha trabajado.',
  },
  {
    id: 'coleccionistas',
    name: 'Apoyado por fondos y colecciones',
    description: 'Fondos públicos, mecenazgo, becas y adquisiciones patrimoniales.',
  },
  {
    id: 'residencias',
    name: 'Participó en residencias',
    description: 'Programas de residencia, talleres y becas.',
  },
  {
    id: 'exhibiciones',
    name: 'Exhibió en',
    description: 'Muestras, salones, bienales y encuentros.',
  },
  {
    id: 'geografias',
    name: 'Radicado en',
    description: 'Territorios, ciudades y regiones de actividad.',
  },
  {
    id: 'formacion',
    name: 'Se formó en',
    description: 'Instituciones educativas, clínicas y talleres de formación.',
  },
  {
    id: 'circulacion',
    name: 'Circula en',
    description: 'Circuitos y espacios de circulación de obra.',
  },
  {
    id: 'personas',
    name: 'Se desempeña como',
    description: 'Roles desempeñados en el campo artístico.',
  },
];
