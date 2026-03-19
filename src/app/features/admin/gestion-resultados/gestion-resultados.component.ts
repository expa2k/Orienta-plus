import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import {
    AdminResultsService,
    ResultadoSesion,
    ResultadoDetalle,
    Estadisticas
} from '../../../core/services/admin-results.service';

@Component({
    selector: 'app-gestion-resultados',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './gestion-resultados.component.html',
    styleUrl: './gestion-resultados.component.css'
})
export class GestionResultadosComponent implements OnInit {
    resultados = signal<ResultadoSesion[]>([]);
    detalle = signal<ResultadoDetalle | null>(null);
    estadisticas = signal<Estadisticas | null>(null);
    loading = signal(true);
    filtroEstado = signal('');
    showDetalle = signal(false);

    riasecNames: Record<string, string> = {
        'R': 'Realista', 'I': 'Investigador', 'A': 'Artistico',
        'S': 'Social', 'E': 'Emprendedor', 'C': 'Convencional'
    };

    filteredResultados = computed(() => {
        const filtro = this.filtroEstado();
        const items = this.resultados();
        if (!filtro) return items;
        return items.filter(r => r.sesion.estado === filtro);
    });

    totalCompletadas = computed(() =>
        this.resultados().filter(r => r.sesion.estado === 'completada').length
    );

    totalEnProgreso = computed(() =>
        this.resultados().filter(r => r.sesion.estado === 'en_progreso').length
    );

    constructor(
        public auth: AuthService,
        private adminService: AdminResultsService
    ) { }

    ngOnInit(): void {
        this.cargarResultados();
        this.cargarEstadisticas();
    }

    cargarResultados(): void {
        this.loading.set(true);
        this.adminService.getResultados().subscribe({
            next: (res) => {
                this.resultados.set(res);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    cargarEstadisticas(): void {
        this.adminService.getEstadisticas().subscribe({
            next: (res) => this.estadisticas.set(res)
        });
    }

    verDetalle(sesionId: number): void {
        this.adminService.getResultadoDetalle(sesionId).subscribe({
            next: (res) => {
                this.detalle.set(res);
                this.showDetalle.set(true);
            }
        });
    }

    cerrarDetalle(): void {
        this.showDetalle.set(false);
        this.detalle.set(null);
    }

    getBarWidth(score: number): number {
        return (score / 5) * 100;
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
}
