import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./features/student/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'test',
        canActivate: [authGuard],
        loadComponent: () => import('./features/student/test-vocacional/test-vocacional.component').then(m => m.TestVocacionalComponent)
    },
    {
        path: 'mis-resultados',
        canActivate: [authGuard],
        loadComponent: () => import('./features/student/mis-resultados/mis-resultados.component').then(m => m.MisResultadosComponent)
    },
    {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
            {
                path: '',
                redirectTo: 'usuarios',
                pathMatch: 'full'
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./features/admin/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent)
            },
            {
                path: 'oferta',
                loadComponent: () => import('./features/admin/gestion-oferta/gestion-oferta.component').then(m => m.GestionOfertaComponent)
            },
            {
                path: 'resultados',
                loadComponent: () => import('./features/admin/gestion-resultados/gestion-resultados.component').then(m => m.GestionResultadosComponent)
            },
            {
                path: 'estadisticas',
                loadComponent: () => import('./features/admin/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent)
            }
        ]
    },
    {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent)
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
