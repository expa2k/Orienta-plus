import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResultadoSesion {
    sesion: {
        id: number;
        usuario_id: number;
        estado: string;
        bloque_actual: number;
        vector_riasec: Record<string, number> | null;
        fecha_inicio: string;
        fecha_fin: string | null;
        total_respuestas: number;
    };
    estudiante: {
        id: number;
        nombre: string;
        correo: string;
    } | null;
    top_dimensiones: { dimension: string; score: number }[];
    perfil_dominante: string | null;
}

export interface ResultadoDetalle extends ResultadoSesion {
    vector_riasec: Record<string, number>;
    respuestas: {
        pregunta_id: number;
        texto: string;
        dimension: string;
        valor: string;
        fecha: string | null;
    }[];
    recomendaciones: {
        carrera: {
            id: number;
            nombre: string;
            descripcion: string;
            perfil_riasec: string;
            area_nombre?: string;
        };
        afinidad: number;
    }[];
}

export interface Estadisticas {
    total_sesiones: number;
    completadas: number;
    en_progreso: number;
    abandonadas: number;
    tasa_completado: number;
    distribucion_perfiles: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class AdminResultsService {
    private API = 'http://localhost:5001/api';

    constructor(private http: HttpClient) { }

    getResultados(estado?: string): Observable<ResultadoSesion[]> {
        const params = estado ? `?estado=${estado}` : '';
        return this.http.get<ResultadoSesion[]>(`${this.API}/admin/resultados${params}`);
    }

    getResultadoDetalle(sesionId: number): Observable<ResultadoDetalle> {
        return this.http.get<ResultadoDetalle>(`${this.API}/admin/resultados/${sesionId}`);
    }

    getEstadisticas(): Observable<Estadisticas> {
        return this.http.get<Estadisticas>(`${this.API}/admin/estadisticas`);
    }
}
