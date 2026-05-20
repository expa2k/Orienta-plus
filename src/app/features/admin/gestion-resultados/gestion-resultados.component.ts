import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    imports: [RouterLink, DatePipe, DecimalPipe, FormsModule],
    templateUrl: './gestion-resultados.component.html',
    styleUrl: './gestion-resultados.component.css'
})
export class GestionResultadosComponent implements OnInit {
    resultados = signal<ResultadoSesion[]>([]);
    detalle = signal<ResultadoDetalle | null>(null);
    estadisticas = signal<Estadisticas | null>(null);
    loading = signal(true);
    filtroEstado = signal('');
    searchQuery = signal('');
    showDetalle = signal(false);

    readonly PAGE_SIZE = 10;
    currentPage = signal(1);

    riasecNames: Record<string, string> = {
        'R': 'Realista', 'I': 'Investigador', 'A': 'Artistico',
        'S': 'Social', 'E': 'Emprendedor', 'C': 'Convencional'
    };

    filteredResultados = computed(() => {
        const filtro = this.filtroEstado();
        const q = this.searchQuery().toLowerCase().trim();
        return this.resultados().filter(r => {
            const matchEstado = !filtro || r.sesion.estado === filtro;
            const matchSearch = !q || (r.estudiante?.nombre?.toLowerCase().includes(q) ?? false);
            return matchEstado && matchSearch;
        });
    });

    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredResultados().length / this.PAGE_SIZE)));

    pagedResultados = computed(() => {
        const page = this.currentPage();
        const start = (page - 1) * this.PAGE_SIZE;
        return this.filteredResultados().slice(start, start + this.PAGE_SIZE);
    });

    totalCompletadas = computed(() => this.resultados().filter(r => r.sesion.estado === 'completada').length);
    totalEnProgreso = computed(() => this.resultados().filter(r => r.sesion.estado === 'en_progreso').length);

    constructor(public auth: AuthService, private adminService: AdminResultsService) { }

    ngOnInit(): void {
        this.cargarResultados();
        this.cargarEstadisticas();
    }

    cargarResultados(): void {
        this.loading.set(true);
        this.adminService.getResultados().subscribe({
            next: (res) => { this.resultados.set(res); this.loading.set(false); },
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
            next: (res) => { this.detalle.set(res); this.showDetalle.set(true); }
        });
    }

    cerrarDetalle(): void { this.showDetalle.set(false); this.detalle.set(null); }

    onSearchChange(): void { this.currentPage.set(1); }

    exportarCSV(): void {
        const rows = this.filteredResultados();
        const headers = ['Estudiante', 'Correo', 'Fecha', 'Estado', 'Perfil Dominante', 'Respuestas'];
        const data = rows.map(r => [
            r.estudiante?.nombre ?? '',
            r.estudiante?.correo ?? '',
            r.sesion.fecha_inicio,
            r.sesion.estado,
            r.perfil_dominante ?? '',
            r.sesion.total_respuestas
        ]);
        const csv = [headers, ...data].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'resultados-orienta.csv'; a.click();
        URL.revokeObjectURL(url);
    }

    getBarWidth(score: number): number { return (score / 5) * 100; }

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
