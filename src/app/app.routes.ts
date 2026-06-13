import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { DefaultLayoutComponent } from './shared/layouts/default-layout/default-layout';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'explore',
    loadComponent: () => import('./features/explore/explore/explore').then(m => m.ExploreComponent)
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects-list/projects-list').then(m => m.ProjectsListComponent)
      },
      {
        path: 'sensors',
        loadComponent: () => import('./features/sensors/sensors-dashboard/sensors-dashboard').then(m => m.SensorsDashboardComponent)
      },
      {
        path: 'credits',
        loadComponent: () => import('./features/credits/credits-portfolio/credits-portfolio').then(m => m.CreditsPortfolioComponent)
      },
      {
        path: 'marketplace',
        loadComponent: () => import('./features/marketplace/marketplace-listings/marketplace-listings').then(m => m.MarketplaceListingsComponent)
      },
      {
        path: 'retirement',
        loadComponent: () => import('./features/retirement/retirement-history/retirement-history').then(m => m.RetirementHistoryComponent)
      },
      {
        path: 'farmers',
        loadComponent: () => import('./features/farmers/farmer-dashboard/farmer-dashboard').then(m => m.FarmerDashboardComponent)
      },
      {
        path: 'governance',
        loadComponent: () => import('./features/governance/governance-dashboard/governance-dashboard').then(m => m.GovernanceDashboardComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
