import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AdminResultsService, Estadisticas } from '../../../core/services/admin-results.service';

@Component({
    selector: 'app-estadisticas',
    standalone: true,
    imports: [RouterLink, DecimalPipe],
    templateUrl: './estadisticas.component.html',
    styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit {
    stats = signal<Estadisticas | null>(null);
    loading = signal(true);

    readonly riasecNames: Record<string, string> = {
        R: 'Realista', I: 'Investigador', A: 'Artístico',
        S: 'Social', E: 'Emprendedor', C: 'Convencional'
    };

    readonly riasecColors: Record<string, string> = {
        R: '#ef4444', I: '#3b82f6', A: '#a855f7',
        S: '#22c55e', E: '#f97316', C: '#6b7280'
    };

    maxDistribucion = computed(() => {
        const d = this.stats()?.distribucion_perfiles ?? {};
        return Math.max(...Object.values(d), 1);
    });

    maxCarreraFrecuencia = computed(() => {
        const tops = this.stats()?.carreras_top ?? [];
        return Math.max(...tops.map(c => c.frecuencia), 1);
    });

    maxTestsMes = computed(() => {
        const meses = this.stats()?.tests_por_mes ?? [];
        return Math.max(...meses.map(m => m.total), 1);
    });

    constructor(public auth: AuthService, private adminService: AdminResultsService) { }

    ngOnInit(): void {
        this.adminService.getEstadisticas().subscribe({
            next: (res) => { this.stats.set(res); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    getDistribBar(dim: string): number {
        const s = this.stats();
        if (!s) return 0;
        return (s.distribucion_perfiles[dim] / this.maxDistribucion()) * 100;
    }

    getCarreraBar(freq: number): number {
        return (freq / this.maxCarreraFrecuencia()) * 100;
    }

    getMesBar(total: number): number {
        return (total / this.maxTestsMes()) * 100;
    }

    getPromedioBar(dim: string): number {
        const s = this.stats();
        if (!s) return 0;
        return ((s.vector_promedio[dim] ?? 0) / 5) * 100;
    }

    getRiasecColor(dim: string): string {
        return this.riasecColors[dim] ?? '#6b7280';
    }
}
