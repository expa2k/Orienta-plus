import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-gestion-usuarios',
    standalone: true,
    imports: [RouterLink, FormsModule, SlicePipe],
    templateUrl: './gestion-usuarios.component.html',
    styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent implements OnInit {
    users = signal<User[]>([]);
    loading = signal(true);
    error = signal('');
    searchTerm = signal('');

    showCreateModal = signal(false);
    showEditModal = signal(false);
    showDeleteModal = signal(false);
    showPasswordModal = signal(false);

    selectedUser = signal<User | null>(null);
    formLoading = signal(false);
    formError = signal('');

    createForm = { nombre: '', apellido: '', correo: '', contrasena: '', rol: 'estudiante' as 'admin' | 'estudiante' };
    editForm = { nombre: '', apellido: '', correo: '', rol: 'estudiante' as 'admin' | 'estudiante' };
    newPassword = '';

    constructor(public auth: AuthService, private userService: UserService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading.set(true);
        this.userService.getAll().subscribe({
            next: (users) => {
                this.users.set(users);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error al cargar los usuarios');
                this.loading.set(false);
            }
        });
    }

    get filteredUsers(): User[] {
        const term = this.searchTerm().toLowerCase();
        if (!term) return this.users();
        return this.users().filter(u =>
            u.nombre.toLowerCase().includes(term) ||
            u.apellido.toLowerCase().includes(term) ||
            u.correo.toLowerCase().includes(term)
        );
    }

    openCreate(): void {
        this.createForm = { nombre: '', apellido: '', correo: '', contrasena: '', rol: 'estudiante' };
        this.formError.set('');
        this.showCreateModal.set(true);
    }

    openEdit(user: User): void {
        this.selectedUser.set(user);
        this.editForm = { nombre: user.nombre, apellido: user.apellido, correo: user.correo, rol: user.rol };
        this.formError.set('');
        this.showEditModal.set(true);
    }

    openDelete(user: User): void {
        this.selectedUser.set(user);
        this.showDeleteModal.set(true);
    }

    openPassword(user: User): void {
        this.selectedUser.set(user);
        this.newPassword = '';
        this.formError.set('');
        this.showPasswordModal.set(true);
    }

    closeAll(): void {
        this.showCreateModal.set(false);
        this.showEditModal.set(false);
        this.showDeleteModal.set(false);
        this.showPasswordModal.set(false);
        this.selectedUser.set(null);
        this.formError.set('');
    }

    submitCreate(): void {
        if (!this.createForm.nombre || !this.createForm.correo || !this.createForm.contrasena) {
            this.formError.set('Completa todos los campos');
            return;
        }
        this.formLoading.set(true);
        this.userService.create(this.createForm).subscribe({
            next: (user) => {
                this.users.update(u => [...u, user]);
                this.formLoading.set(false);
                this.closeAll();
            },
            error: (err) => {
                this.formError.set(err?.error?.message ?? 'Error al crear usuario');
                this.formLoading.set(false);
            }
        });
    }

    submitEdit(): void {
        const user = this.selectedUser();
        if (!user) return;
        this.formLoading.set(true);
        this.userService.update(user.id, this.editForm).subscribe({
            next: (updated) => {
                this.users.update(u => u.map(x => x.id === updated.id ? updated : x));
                this.formLoading.set(false);
                this.closeAll();
            },
            error: (err) => {
                this.formError.set(err?.error?.message ?? 'Error al actualizar');
                this.formLoading.set(false);
            }
        });
    }

    confirmDelete(): void {
        const user = this.selectedUser();
        if (!user) return;
        this.formLoading.set(true);
        this.userService.delete(user.id).subscribe({
            next: () => {
                this.users.update(u => u.filter(x => x.id !== user.id));
                this.formLoading.set(false);
                this.closeAll();
            },
            error: () => {
                this.formLoading.set(false);
                this.closeAll();
            }
        });
    }

    submitPassword(): void {
        if (!this.newPassword || this.newPassword.length < 6) {
            this.formError.set('Mínimo 6 caracteres');
            return;
        }
        const user = this.selectedUser();
        if (!user) return;
        this.formLoading.set(true);
        this.userService.resetPassword(user.id, this.newPassword).subscribe({
            next: () => {
                this.formLoading.set(false);
                this.closeAll();
            },
            error: () => {
                this.formError.set('Error al actualizar contraseña');
                this.formLoading.set(false);
            }
        });
    }

    toggleActive(user: User): void {
        this.userService.toggleActive(user.id, !user.activo).subscribe({
            next: (updated) => {
                this.users.update(u => u.map(x => x.id === updated.id ? updated : x));
            }
        });
    }
}
