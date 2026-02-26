import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './perfil.component.html',
    styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
    auth = inject(AuthService);
    router = inject(Router);
    loading = signal(false);
    success = signal('');
    error = signal('');

    form = {
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
        confirmar: ''
    };

    showPass = signal(false);

    ngOnInit(): void {
        const u = this.auth.currentUser();
        if (u) {
            this.form.nombre = u.nombre;
            this.form.apellido = u.apellido;
            this.form.correo = u.correo;
        }
    }

    goBack(): void {
        const role = this.auth.getRole();
        if (role === 'admin') {
            this.router.navigate(['/admin/usuarios']);
        } else {
            this.router.navigate(['/dashboard']);
        }
    }

    onSubmit(): void {
        this.error.set('');
        this.success.set('');

        if (!this.form.nombre || !this.form.apellido || !this.form.correo) {
            this.error.set('Nombre, apellido y correo son requeridos');
            return;
        }

        if (this.form.contrasena && this.form.contrasena !== this.form.confirmar) {
            this.error.set('Las contraseñas no coinciden');
            return;
        }

        this.loading.set(true);

        const payload: { nombre: string; apellido: string; correo: string; contrasena?: string } = {
            nombre: this.form.nombre,
            apellido: this.form.apellido,
            correo: this.form.correo
        };

        if (this.form.contrasena) {
            payload.contrasena = this.form.contrasena;
        }

        this.auth.updateProfile(payload).subscribe({
            next: () => {
                this.loading.set(false);
                this.success.set('Perfil actualizado correctamente');
                this.form.contrasena = '';
                this.form.confirmar = '';
            },
            error: (err: { error?: { message?: string } }) => {
                this.loading.set(false);
                this.error.set(err.error?.message ?? 'Error al actualizar');
            }
        });
    }
}
