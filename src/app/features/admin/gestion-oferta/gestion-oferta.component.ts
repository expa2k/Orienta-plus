import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { OfertaService } from '../../../core/services/oferta.service';
import { AreaProfesional, Carrera } from '../../../core/models/oferta.model';

@Component({
    selector: 'app-gestion-oferta',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './gestion-oferta.component.html',
    styleUrl: './gestion-oferta.component.css'
})
export class GestionOfertaComponent implements OnInit {
    activeTab = signal<'areas' | 'carreras'>('areas');
    areas = signal<AreaProfesional[]>([]);
    carreras = signal<Carrera[]>([]);
    loading = signal(true);

    showAreaModal = signal(false);
    showCarreraModal = signal(false);
    showDeleteModal = signal(false);
    editingArea = signal<AreaProfesional | null>(null);
    editingCarrera = signal<Carrera | null>(null);
    deletingItem = signal<{ type: 'area' | 'carrera'; id: number; nombre: string } | null>(null);

    formLoading = signal(false);
    formError = signal('');

    areaForm = { nombre: '', codigo_riasec: '', descripcion: '', icono: '' };
    carreraForm = { area_id: 0, nombre: '', descripcion: '', perfil_riasec: '', campo_laboral: '' };

    riasecLabels: Record<string, string> = {
        'R': 'Realista', 'I': 'Investigador', 'A': 'Artístico',
        'S': 'Social', 'E': 'Emprendedor', 'C': 'Convencional'
    };

    constructor(public auth: AuthService, private ofertaService: OfertaService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading.set(true);
        this.ofertaService.getAreas().subscribe({
            next: (areas) => {
                this.areas.set(areas);
                this.ofertaService.getCarreras().subscribe({
                    next: (carreras) => {
                        this.carreras.set(carreras);
                        this.loading.set(false);
                    },
                    error: () => this.loading.set(false)
                });
            },
            error: () => this.loading.set(false)
        });
    }

    get filteredCarreras(): Carrera[] {
        return this.carreras();
    }

    getAreaNombre(areaId: number): string {
        return this.areas().find(a => a.id === areaId)?.nombre ?? '';
    }

    // ── Area modal ──
    openAreaModal(area?: AreaProfesional): void {
        if (area) {
            this.editingArea.set(area);
            this.areaForm = {
                nombre: area.nombre,
                codigo_riasec: area.codigo_riasec,
                descripcion: area.descripcion || '',
                icono: area.icono || ''
            };
        } else {
            this.editingArea.set(null);
            this.areaForm = { nombre: '', codigo_riasec: '', descripcion: '', icono: '' };
        }
        this.formError.set('');
        this.showAreaModal.set(true);
    }

    submitArea(): void {
        if (!this.areaForm.nombre || !this.areaForm.codigo_riasec) {
            this.formError.set('Nombre y código RIASEC son requeridos');
            return;
        }
        this.formLoading.set(true);
        const editing = this.editingArea();

        const obs = editing
            ? this.ofertaService.updateArea(editing.id, this.areaForm)
            : this.ofertaService.createArea(this.areaForm);

        obs.subscribe({
            next: () => {
                this.formLoading.set(false);
                this.closeAll();
                this.loadData();
            },
            error: (err) => {
                this.formError.set(err?.error?.message ?? 'Error al guardar');
                this.formLoading.set(false);
            }
        });
    }

    // ── Carrera modal ──
    openCarreraModal(carrera?: Carrera): void {
        if (carrera) {
            this.editingCarrera.set(carrera);
            this.carreraForm = {
                area_id: carrera.area_id,
                nombre: carrera.nombre,
                descripcion: carrera.descripcion || '',
                perfil_riasec: carrera.perfil_riasec,
                campo_laboral: carrera.campo_laboral || ''
            };
        } else {
            this.editingCarrera.set(null);
            this.carreraForm = {
                area_id: this.areas().length ? this.areas()[0].id : 0,
                nombre: '', descripcion: '', perfil_riasec: '', campo_laboral: ''
            };
        }
        this.formError.set('');
        this.showCarreraModal.set(true);
    }

    submitCarrera(): void {
        if (!this.carreraForm.nombre || !this.carreraForm.perfil_riasec || !this.carreraForm.area_id) {
            this.formError.set('Área, nombre y perfil RIASEC son requeridos');
            return;
        }
        this.formLoading.set(true);
        const editing = this.editingCarrera();

        const obs = editing
            ? this.ofertaService.updateCarrera(editing.id, this.carreraForm)
            : this.ofertaService.createCarrera(this.carreraForm);

        obs.subscribe({
            next: () => {
                this.formLoading.set(false);
                this.closeAll();
                this.loadData();
            },
            error: (err) => {
                this.formError.set(err?.error?.message ?? 'Error al guardar');
                this.formLoading.set(false);
            }
        });
    }

    // ── Delete ──
    openDelete(type: 'area' | 'carrera', id: number, nombre: string): void {
        this.deletingItem.set({ type, id, nombre });
        this.showDeleteModal.set(true);
    }

    confirmDelete(): void {
        const item = this.deletingItem();
        if (!item) return;
        this.formLoading.set(true);

        const obs = item.type === 'area'
            ? this.ofertaService.deleteArea(item.id)
            : this.ofertaService.deleteCarrera(item.id);

        obs.subscribe({
            next: () => {
                this.formLoading.set(false);
                this.closeAll();
                this.loadData();
            },
            error: (err) => {
                this.formError.set(err?.error?.message ?? 'Error al eliminar');
                this.formLoading.set(false);
            }
        });
    }

    closeAll(): void {
        this.showAreaModal.set(false);
        this.showCarreraModal.set(false);
        this.showDeleteModal.set(false);
        this.editingArea.set(null);
        this.editingCarrera.set(null);
        this.deletingItem.set(null);
        this.formError.set('');
    }
}
