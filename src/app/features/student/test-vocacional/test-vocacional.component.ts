import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TestService } from '../../../core/services/test.service';
import {
    PreguntaTest,
    SesionTest,
    VectorRiasec,
    RespuestaPayload,
    RecomendacionCarrera
} from '../../../core/models/test.model';

type TestPhase = 'intro' | 'continuar' | 'preguntas' | 'pregunta-abierta' | 'procesando' | 'resultados';

@Component({
    selector: 'app-test-vocacional',
    standalone: true,
    imports: [FormsModule, DecimalPipe],
    templateUrl: './test-vocacional.component.html',
    styleUrl: './test-vocacional.component.css'
})
export class TestVocacionalComponent {
    phase = signal<TestPhase>('intro');
    sesion = signal<SesionTest | null>(null);
    preguntas = signal<PreguntaTest[]>([]);
    respuestas = signal<Record<number, string>>({});
    savedResponses = signal<Record<number, string>>({});
    respondidas = signal<number[]>([]);
    loading = signal(false);
    error = signal('');

    vectorFinal = signal<VectorRiasec | null>(null);
    topDimensiones = signal<{ dimension: string; score: number }[]>([]);
    recomendaciones = signal<RecomendacionCarrera[]>([]);

    currentQuestion = signal(0);

    riasecNames: Record<string, string> = {
        'R': 'Realista', 'I': 'Investigador', 'A': 'Artistico',
        'S': 'Social', 'E': 'Emprendedor', 'C': 'Convencional'
    };

    riasecDescriptions: Record<string, string> = {
        'R': 'Trabajo practico, manual y mecanico',
        'I': 'Pensamiento analitico y cientifico',
        'A': 'Creatividad, expresion y originalidad',
        'S': 'Ayudar, ensenar y servir a otros',
        'E': 'Liderazgo y toma de decisiones',
        'C': 'Orden, datos y procedimientos'
    };

    likertOptions = [
        { value: '1', label: 'Muy en desacuerdo' },
        { value: '2', label: 'En desacuerdo' },
        { value: '3', label: 'Neutral' },
        { value: '4', label: 'De acuerdo' },
        { value: '5', label: 'Muy de acuerdo' }
    ];

    progress = computed(() => {
        const total = this.preguntas().length;
        if (total === 0) return 0;
        const answered = Object.keys(this.respuestas()).length;
        return Math.round((answered / total) * 100);
    });

    allAnswered = computed(() => {
        const total = this.preguntas().length;
        if (total === 0) return false;
        
        // Verifica que todas las preguntas del bloque tengan respuesta.
        // Si es abierta, exige un mínimo de 15 caracteres para asegurar buen análisis de la IA.
        return this.preguntas().every(p => {
            const r = this.respuestas()[p.id];
            if (!r) return false;
            
            if (p.tipo === 'abierta') {
                return r.trim().length > 15;
            }
            return true;
        });
    });

    currentPregunta = computed(() => {
        const idx = this.currentQuestion();
        const preg = this.preguntas();
        return preg[idx] ?? null;
    });

    constructor(
        public auth: AuthService,
        private testService: TestService,
        private router: Router
    ) { }

    iniciarTest(): void {
        this.loading.set(true);
        this.error.set('');

        this.testService.iniciarTest().subscribe({
            next: (res) => {
                if (res.tiene_sesion_activa) {
                    this.sesion.set(res.sesion);
                    this.preguntas.set(res.preguntas);
                    this.respondidas.set(res.respondidas);
                    this.savedResponses.set(res.respuestas_guardadas || {});
                    this.phase.set('continuar');
                    this.loading.set(false);
                    return;
                }

                this.sesion.set(res.sesion);
                this.preguntas.set(res.preguntas);
                this.respondidas.set(res.respondidas);
                this.currentQuestion.set(0);
                this.respuestas.set({});
                this.phase.set('preguntas');
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Error al iniciar el test');
                this.loading.set(false);
            }
        });
    }

    continuarTest(): void {
        const saved = this.savedResponses();
        const currentBlockQuestionIds = this.preguntas().map(p => p.id);
        const restoredForBlock: Record<number, string> = {};
        for (const [pid, val] of Object.entries(saved)) {
            if (currentBlockQuestionIds.includes(Number(pid))) {
                restoredForBlock[Number(pid)] = val;
            }
        }
        this.respuestas.set(restoredForBlock);

        const firstUnanswered = this.preguntas().findIndex(p => !restoredForBlock[p.id]);
        this.currentQuestion.set(firstUnanswered >= 0 ? firstUnanswered : 0);

        this.phase.set('preguntas');
    }

    reiniciarTest(): void {
        this.loading.set(true);
        this.testService.iniciarTestNuevo().subscribe({
            next: (res) => {
                this.sesion.set(res.sesion);
                this.preguntas.set(res.preguntas);
                this.respondidas.set([]);
                this.currentQuestion.set(0);
                this.respuestas.set({});
                this.phase.set('preguntas');
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Error al reiniciar');
                this.loading.set(false);
            }
        });
    }

    guardarRespuestaLocal(preguntaId: number, valor: string): void {
        this.respuestas.update(prev => ({ ...prev, [preguntaId]: valor }));
    }

    seleccionarRespuesta(preguntaId: number, valor: string): void {
        this.guardarRespuestaLocal(preguntaId, valor);

        const sesionId = this.sesion()?.id;
        if (sesionId) {
            this.testService.responder(sesionId, [{ pregunta_id: preguntaId, valor }]).subscribe();
        }
    }

    getRespuesta(preguntaId: number): string {
        return this.respuestas()[preguntaId] ?? '';
    }

    siguiente(): void {
        const idx = this.currentQuestion();
        if (idx < this.preguntas().length - 1) {
            this.currentQuestion.set(idx + 1);
        }
    }

    anterior(): void {
        const idx = this.currentQuestion();
        if (idx > 0) {
            this.currentQuestion.set(idx - 1);
        }
    }

    enviarBloque(): void {
        const sesionId = this.sesion()?.id;
        if (!sesionId) return;

        this.loading.set(true);
        const respuestasPayload: RespuestaPayload[] = Object.entries(this.respuestas()).map(
            ([pid, val]) => ({ pregunta_id: Number(pid), valor: val })
        );

        this.testService.responder(sesionId, respuestasPayload).subscribe({
            next: () => {
                this.testService.siguienteBloque(sesionId).subscribe({
                    next: (sig) => {
                        if (sig.accion === 'finalizar') {
                            this.finalizarTest();
                        } else if (sig.preguntas && sig.preguntas.length > 0) {
                            this.preguntas.set(sig.preguntas);
                            this.respuestas.set({});
                            this.currentQuestion.set(0);
                            if (sig.sesion) this.sesion.set(sig.sesion);
                            this.loading.set(false);
                        } else {
                            this.finalizarTest();
                        }
                    },
                    error: () => {
                        this.finalizarTest();
                    }
                });
            },
            error: (err) => {
                this.error.set(err?.error?.message ?? 'Error al enviar respuestas');
                this.loading.set(false);
            }
        });
    }

    finalizarTest(): void {
        const sesionId = this.sesion()?.id;
        if (!sesionId) return;

        this.phase.set('procesando');

        this.testService.finalizarTest(sesionId).subscribe({
            next: (res) => {
                this.sesion.set(res.sesion);
                this.vectorFinal.set(res.vector_riasec);
                this.topDimensiones.set(res.top_dimensiones);
                this.recomendaciones.set(res.recomendaciones);

                setTimeout(() => {
                    this.phase.set('resultados');
                    this.loading.set(false);
                }, 2000);
            },
            error: () => {
                this.error.set('Error al procesar resultados');
                this.phase.set('preguntas');
                this.loading.set(false);
            }
        });
    }

    volverDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    getMaxScore(): number {
        const v = this.vectorFinal();
        if (!v) return 5;
        return Math.max(...Object.values(v), 5);
    }

    getBarWidth(score: number): number {
        return (score / 5) * 100;
    }
}
