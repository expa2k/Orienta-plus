export interface PreguntaTest {
  id: number;
  bloque: number;
  tipo: 'likert' | 'opcion_multiple';
  texto: string;
  opciones: any;
  dimension_riasec: string;
  orden: number;
}

export interface SesionTest {
  id: number;
  usuario_id: number;
  estado: 'en_progreso' | 'completada' | 'abandonada';
  bloque_actual: number;
  vector_riasec: VectorRiasec;
  fecha_inicio: string;
  fecha_fin: string | null;
  total_respuestas: number;
}

export interface VectorRiasec {
  [key: string]: number;
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

export interface RespuestaPayload {
  pregunta_id: number;
  valor: string;
}

export interface IniciarTestResponse {
  sesion: SesionTest;
  preguntas: PreguntaTest[];
  respondidas: number[];
  respuestas_guardadas?: Record<number, string>;
  tiene_sesion_activa: boolean;
  mensaje: string;
}

export interface ResponderResponse {
  sesion: SesionTest;
  vector_riasec: VectorRiasec;
  total_respuestas: number;
}

export interface SiguienteResponse {
  accion: 'continuar' | 'finalizar';
  sesion?: SesionTest;
  preguntas?: PreguntaTest[];
  dimensiones_foco?: string[];
  perfil_claro?: boolean;
  vector_riasec?: VectorRiasec;
  mensaje?: string;
}

export interface RecomendacionCarrera {
  carrera: {
    id: number;
    nombre: string;
    descripcion: string;
    perfil_riasec: string;
    campo_laboral: string;
    area_nombre: string;
  };
  afinidad: number;
}

export interface FinalizarResponse {
  sesion: SesionTest;
  vector_riasec: VectorRiasec;
  top_dimensiones: { dimension: string; score: number }[];
  recomendaciones: RecomendacionCarrera[];
  mensaje: string;
}
