import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly API = 'http://localhost:5001/api';

    constructor(private http: HttpClient) { }

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(`${this.API}/users`);
    }

    create(user: Partial<User> & { contrasena: string }): Observable<User> {
        return this.http.post<User>(`${this.API}/users`, user);
    }

    update(id: number, data: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.API}/users/${id}`, data);
    }

    toggleActive(id: number, activo: boolean): Observable<User> {
        return this.http.patch<User>(`${this.API}/users/${id}/toggle`, { activo });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API}/users/${id}`);
    }

    resetPassword(id: number, contrasena: string): Observable<void> {
        return this.http.patch<void>(`${this.API}/users/${id}/password`, { contrasena });
    }
}
