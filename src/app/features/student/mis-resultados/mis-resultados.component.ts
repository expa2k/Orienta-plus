import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TestService } from '../../../core/services/test.service';
import { SesionTest, VectorRiasec, FinalizarResponse } from '../../../core/models/test.model';

interface ResultadoCompleto {
    sesion: SesionTest;
    vector_riasec: VectorRiasec;
    top_dimensiones: { dimension: string; score: number }[];
    recomendaciones: { carrera: { id: number; nombre: string; descripcion: string; perfil_riasec: string; campo_laboral: string; area_nombre: string }; afinidad: number }[];
}

@Component({
    selector: 'app-mis-resultados',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './mis-resultados.component.html',
    styleUrl: './mis-resultados.component.css'
})
export class MisResultadosComponent implements OnInit {
    sesiones = signal<SesionTest[]>([]);
    detalleSeleccionado = signal<ResultadoCompleto | null>(null);
    loading = signal(true);
    loadingDetalle = signal(false);

    riasecNames: Record<string, string> = {
        'R': 'Realista', 'I': 'Investigador', 'A': 'Artistico',
        'S': 'Social', 'E': 'Emprendedor', 'C': 'Convencional'
    };

    constructor(
        public auth: AuthService,
        private testService: TestService
    ) { }

    ngOnInit(): void {
        this.cargarHistorial();
    }

    cargarHistorial(): void {
        this.loading.set(true);
        this.testService.getHistorial().subscribe({
            next: (res) => {
                this.sesiones.set(res);
                this.loading.set(false);
                const ultimaCompletada = res.find(s => s.estado === 'completada');
                if (ultimaCompletada) {
                    this.verDetalle(ultimaCompletada.id);
                }
            },
            error: () => this.loading.set(false)
        });
    }

    verDetalle(sesionId: number): void {
        this.loadingDetalle.set(true);
        this.testService.getDetalleSesion(sesionId).subscribe({
            next: (res) => {
                this.detalleSeleccionado.set(res);
                this.loadingDetalle.set(false);
            },
            error: () => this.loadingDetalle.set(false)
        });
    }

    getEstadoClass(estado: string): string {
        switch (estado) {
            case 'completada': return 'badge-success';
            case 'en_progreso': return 'badge-warning';
            case 'abandonada': return 'badge-danger';
            default: return '';
        }
    }

    getEstadoLabel(estado: string): string {
        switch (estado) {
            case 'completada': return 'Completada';
            case 'en_progreso': return 'En progreso';
            case 'abandonada': return 'Abandonada';
            default: return estado;
        }
    }

    getBarWidth(score: number): number {
        return (score / 5) * 100;
    }
}
