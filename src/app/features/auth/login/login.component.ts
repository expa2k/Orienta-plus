import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    form: FormGroup;
    loading = signal(false);
    error = signal('');
    showPassword = signal(false);

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {
        this.form = this.fb.group({
            correo: ['', [Validators.required, Validators.email]],
            contrasena: ['', [Validators.required, Validators.minLength(6)]],
            recordar: [false]
        });
    }

    togglePassword(): void {
        this.showPassword.update(v => !v);
    }

    onSubmit(): void {
        if (this.form.invalid || this.loading()) return;

        this.error.set('');
        this.loading.set(true);

        const { correo, contrasena } = this.form.value;

        this.auth.login({ correo, contrasena }).subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.user.rol === 'admin') {
                    this.router.navigate(['/admin/usuarios']);
                } else {
                    this.router.navigate(['/dashboard']);
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err?.error?.message ?? 'Credenciales incorrectas');
            }
        });
    }

    get correoInvalid(): boolean {
        const ctrl = this.form.get('correo');
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    get contrasenaInvalid(): boolean {
        const ctrl = this.form.get('contrasena');
        return !!(ctrl?.invalid && ctrl?.touched);
    }
}
