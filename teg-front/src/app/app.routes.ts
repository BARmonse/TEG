import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'game',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/game/game-list/game-list.component').then(m => m.GameListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/game/create-game/create-game.component').then(m => m.CreateGameComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/game/game/game.component').then(m => m.GameComponent)
      }
    ]
  }
]; 