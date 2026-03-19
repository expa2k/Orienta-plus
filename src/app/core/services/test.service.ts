import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    IniciarTestResponse,
    ResponderResponse,
    SiguienteResponse,
    FinalizarResponse,
    RespuestaPayload,
    SesionTest
} from '../models/test.model';

@Injectable({ providedIn: 'root' })
export class TestService {
    private readonly API = 'http://localhost:5001/api';

    constructor(private http: HttpClient) { }

    iniciarTest(): Observable<IniciarTestResponse> {
        return this.http.post<IniciarTestResponse>(`${this.API}/test/iniciar`, {});
    }

    iniciarTestNuevo(): Observable<IniciarTestResponse> {
        return this.http.post<IniciarTestResponse>(`${this.API}/test/iniciar`, { forzar_nuevo: true });
    }

    abandonarTest(sesionId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.API}/test/abandonar/${sesionId}`, {});
    }

    responder(sesionId: number, respuestas: RespuestaPayload[]): Observable<ResponderResponse> {
        return this.http.post<ResponderResponse>(`${this.API}/test/responder`, {
            sesion_id: sesionId,
            respuestas
        });
    }

    siguienteBloque(sesionId: number): Observable<SiguienteResponse> {
        return this.http.get<SiguienteResponse>(`${this.API}/test/siguiente/${sesionId}`);
    }

    finalizarTest(sesionId: number): Observable<FinalizarResponse> {
        return this.http.post<FinalizarResponse>(`${this.API}/test/finalizar/${sesionId}`, {});
    }

    getHistorial(): Observable<SesionTest[]> {
        return this.http.get<SesionTest[]>(`${this.API}/test/historial`);
    }

    getSesion(sesionId: number): Observable<SesionTest> {
        return this.http.get<SesionTest>(`${this.API}/test/sesion/${sesionId}`);
    }

    getDetalleSesion(sesionId: number): Observable<any> {
        return this.http.get<any>(`${this.API}/test/sesion/${sesionId}/detalle`);
    }
}
