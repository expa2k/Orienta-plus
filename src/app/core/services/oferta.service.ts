import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AreaProfesional, Carrera } from '../models/oferta.model';

@Injectable({ providedIn: 'root' })
export class OfertaService {
    private readonly API = 'http://localhost:5001/api';

    constructor(private http: HttpClient) { }


    getAreas(): Observable<AreaProfesional[]> {
        return this.http.get<AreaProfesional[]>(`${this.API}/oferta/areas`);
    }

    getArea(id: number): Observable<AreaProfesional> {
        return this.http.get<AreaProfesional>(`${this.API}/oferta/areas/${id}`);
    }

    createArea(data: Partial<AreaProfesional>): Observable<AreaProfesional> {
        return this.http.post<AreaProfesional>(`${this.API}/oferta/areas`, data);
    }

    updateArea(id: number, data: Partial<AreaProfesional>): Observable<AreaProfesional> {
        return this.http.put<AreaProfesional>(`${this.API}/oferta/areas/${id}`, data);
    }

    deleteArea(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API}/oferta/areas/${id}`);
    }


    getCarreras(areaId?: number): Observable<Carrera[]> {
        const params = areaId ? `?area_id=${areaId}` : '';
        return this.http.get<Carrera[]>(`${this.API}/oferta/carreras${params}`);
    }

    getCarrera(id: number): Observable<Carrera> {
        return this.http.get<Carrera>(`${this.API}/oferta/carreras/${id}`);
    }

    createCarrera(data: Partial<Carrera>): Observable<Carrera> {
        return this.http.post<Carrera>(`${this.API}/oferta/carreras`, data);
    }

    updateCarrera(id: number, data: Partial<Carrera>): Observable<Carrera> {
        return this.http.put<Carrera>(`${this.API}/oferta/carreras/${id}`, data);
    }

    deleteCarrera(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API}/oferta/carreras/${id}`);
    }
}
