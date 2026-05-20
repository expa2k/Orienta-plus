import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TestService } from '../../../core/services/test.service';
import { SesionTest, VectorRiasec } from '../../../core/models/test.model';

interface ResultadoCompleto {
    sesion: SesionTest;
    vector_riasec: VectorRiasec;
    top_dimensiones: { dimension: string; score: number }[];
    recomendaciones: {
        carrera: {
            id: number; nombre: string; descripcion: string;
            perfil_riasec: string; campo_laboral: string;
            area_nombre: string; salario_promedio?: number; demanda_laboral?: string;
        };
        afinidad: number;
    }[];
}

@Component({
    selector: 'app-mis-resultados',
    standalone: true,
    imports: [RouterLink, DatePipe, DecimalPipe],
    templateUrl: './mis-resultados.component.html',
    styleUrl: './mis-resultados.component.css'
})
export class MisResultadosComponent implements OnInit {
    sesiones = signal<SesionTest[]>([]);
    detalleSeleccionado = signal<ResultadoCompleto | null>(null);
    detalleAnterior = signal<ResultadoCompleto | null>(null);
    loading = signal(true);
    loadingDetalle = signal(false);

    readonly riasecNames: Record<string, string> = {
        R: 'Realista', I: 'Investigador', A: 'Artístico',
        S: 'Social', E: 'Emprendedor', C: 'Convencional'
    };

    constructor(public auth: AuthService, private testService: TestService) { }

    ngOnInit(): void { this.cargarHistorial(); }

    cargarHistorial(): void {
        this.loading.set(true);
        this.testService.getHistorial().subscribe({
            next: (res) => {
                this.sesiones.set(res);
                this.loading.set(false);
                const ultima = res.find(s => s.estado === 'completada');
                if (ultima) this.verDetalle(ultima.id);
            },
            error: () => this.loading.set(false)
        });
    }

    verDetalle(sesionId: number): void {
        this.loadingDetalle.set(true);
        this.detalleAnterior.set(null);

        const completadas = this.sesiones().filter(s => s.estado === 'completada');
        const idx = completadas.findIndex(s => s.id === sesionId);
        const anterior = completadas[idx + 1];

        this.testService.getDetalleSesion(sesionId).subscribe({
            next: (res) => {
                this.detalleSeleccionado.set(res);
                this.loadingDetalle.set(false);
                if (anterior) {
                    this.testService.getDetalleSesion(anterior.id).subscribe({
                        next: (prev) => this.detalleAnterior.set(prev)
                    });
                }
            },
            error: () => this.loadingDetalle.set(false)
        });
    }

    getDelta(dim: string): number | null {
        const actual = this.detalleSeleccionado()?.vector_riasec?.[dim];
        const prev = this.detalleAnterior()?.vector_riasec?.[dim];
        if (actual == null || prev == null) return null;
        return Math.round((actual - prev) * 10) / 10;
    }

    exportarPDF(): void {
        const d = this.detalleSeleccionado();
        if (!d) return;
        const style = `
            <style>
                body { font-family: Inter, Arial, sans-serif; padding: 40px; color: #111; }
                h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
                h2 { font-size: 16px; font-weight: 700; margin: 24px 0 12px; border-bottom: 2px solid #f97316; padding-bottom: 8px; }
                .meta { color: #666; font-size: 13px; margin-bottom: 32px; }
                .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
                .bar-label { width: 120px; font-size: 13px; }
                .bar-track { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
                .bar-fill { height: 100%; background: #f97316; border-radius: 4px; }
                .bar-score { font-size: 13px; font-weight: 700; width: 30px; text-align: right; }
                .reco-item { background: #f9fafb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
                .reco-name { font-size: 15px; font-weight: 700; }
                .reco-afinidad { color: #f97316; font-weight: 700; }
                .reco-desc { font-size: 13px; color: #555; margin-top: 4px; }
                @page { margin: 20mm; }
            </style>`;
        const dims = ['R', 'I', 'A', 'S', 'E', 'C'];
        const barsHtml = dims.map(dim => {
            const score = d.vector_riasec?.[dim] ?? 0;
            const pct = Math.round((score / 5) * 100);
            return `<div class="bar-row">
                <div class="bar-label">${dim} — ${this.riasecNames[dim]}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                <div class="bar-score">${score.toFixed(1)}</div>
            </div>`;
        }).join('');
        const recoHtml = (d.recomendaciones ?? []).slice(0, 3).map((r, i) => `
            <div class="reco-item">
                <div class="reco-name">${i + 1}. ${r.carrera.nombre} <span class="reco-afinidad">${r.afinidad}%</span></div>
                <div class="reco-desc">${r.carrera.descripcion ?? ''}</div>
            </div>`).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Reporte Vocacional</title>${style}</head>
            <body>
                <h1>Reporte Vocacional</h1>
                <p class="meta">Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <h2>Perfil RIASEC</h2>${barsHtml}
                <h2>Carreras Recomendadas</h2>${recoHtml}
            </body></html>`;
        const win = window.open('', '_blank');
        if (win) { win.document.write(html); win.document.close(); win.print(); }
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

    getBarWidth(score: number): number { return (score / 5) * 100; }
}
