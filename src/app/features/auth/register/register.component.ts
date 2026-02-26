import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatch(control: AbstractControl) {
    const pass = control.get('contrasena')?.value;
    const confirm = control.get('confirmar')?.value;
    return pass === confirm ? null : { mismatch: true };
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    form: FormGroup;
    loading = signal(false);
    error = signal('');
    success = signal('');
    showPassword = signal(false);
    showConfirm = signal(false);

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {
        this.form = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2)]],
            apellido: ['', [Validators.required, Validators.minLength(2)]],
            correo: ['', [Validators.required, Validators.email]],
            contrasena: ['', [Validators.required, Validators.minLength(6)]],
            confirmar: ['', Validators.required]
        }, { validators: passwordMatch });
    }

    togglePassword(): void { this.showPassword.update(v => !v); }
    toggleConfirm(): void { this.showConfirm.update(v => !v); }

    fieldInvalid(name: string): boolean {
        const ctrl = this.form.get(name);
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    get mismatch(): boolean {
        return !!(this.form.hasError('mismatch') && this.form.get('confirmar')?.touched);
    }

    onSubmit(): void {
        if (this.form.invalid || this.loading()) return;

        this.error.set('');
        this.loading.set(true);

        const { nombre, apellido, correo, contrasena } = this.form.value;

        this.auth.register({ nombre, apellido, correo, contrasena }).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err?.error?.message ?? 'Error al crear la cuenta');
            }
        });
    }
}
