export interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: 'admin' | 'estudiante';
  activo: boolean;
  fecha_registro: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
