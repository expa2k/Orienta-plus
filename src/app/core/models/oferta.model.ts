export interface AreaProfesional {
  id: number;
  nombre: string;
  codigo_riasec: string;
  descripcion: string;
  icono: string;
  activo: boolean;
  total_carreras: number;
}

export interface Carrera {
  id: number;
  area_id: number;
  nombre: string;
  descripcion: string;
  perfil_riasec: string;
  campo_laboral: string;
  activo: boolean;
  area_nombre: string;
}
