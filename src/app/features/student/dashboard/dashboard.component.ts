import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TestService } from '../../../core/services/test.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterLink, DecimalPipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    ultimoResultado = signal<any>(null);
    loadingResultado = signal(false);

    riasecNames: Record<string, string> = {
        R: 'Realista', I: 'Investigador', A: 'Artístico',
        S: 'Social', E: 'Emprendedor', C: 'Convencional'
    };

    constructor(public auth: AuthService, private testService: TestService) { }

    ngOnInit(): void {
        this.cargarUltimoResultado();
    }

    cargarUltimoResultado(): void {
        this.loadingResultado.set(true);
        this.testService.getHistorial().subscribe({
            next: (sesiones) => {
                const ultima = sesiones.find(s => s.estado === 'completada');
                if (ultima) {
                    this.testService.getDetalleSesion(ultima.id).subscribe({
                        next: (detalle) => { this.ultimoResultado.set(detalle); this.loadingResultado.set(false); },
                        error: () => this.loadingResultado.set(false)
                    });
                } else {
                    this.loadingResultado.set(false);
                }
            },
            error: () => this.loadingResultado.set(false)
        });
    }
}
