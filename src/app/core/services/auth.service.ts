import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'orienta_token';
    private readonly API = 'http://localhost:5001/api';

    currentUser = signal<User | null>(null);
    token = signal<string | null>(null);

    isAuthenticated = computed(() => !!this.token());
    isAdmin = computed(() => this.currentUser()?.rol === 'admin');
    isStudent = computed(() => this.currentUser()?.rol === 'estudiante');

    constructor(private http: HttpClient, private router: Router) {
        this.loadFromStorage();
    }

    login(payload: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/auth/login`, payload).pipe(
            tap(res => this.setSession(res))
        );
    }

    register(payload: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/auth/register`, payload).pipe(
            tap(res => this.setSession(res))
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.token.set(null);
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    getRole(): string | null {
        return this.currentUser()?.rol ?? null;
    }

    updateProfile(payload: { nombre: string; apellido: string; correo: string; contrasena?: string }): Observable<AuthResponse> {
        return this.http.patch<AuthResponse>(`${this.API}/auth/me`, payload).pipe(
            tap(res => this.setSession(res))
        );
    }


    private setSession(res: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.token.set(res.token);
        this.currentUser.set(res.user);
    }

    private loadFromStorage(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (!token) return;

        try {
            const decoded: any = jwtDecode(token);
            const now = Math.floor(Date.now() / 1000);

            if (decoded.exp && decoded.exp < now) {
                localStorage.removeItem(this.TOKEN_KEY);
                return;
            }

            this.token.set(token);
            this.currentUser.set(decoded.user ?? null);
        } catch {
            localStorage.removeItem(this.TOKEN_KEY);
        }
    }
}
