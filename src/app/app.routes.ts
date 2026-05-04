import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		title: 'DM Real Estate | Home',
		loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent)
	},
	{
		path: 'listings',
		title: 'DM Real Estate | Listings',
		loadComponent: () => import('./pages/listings/listings.component').then((m) => m.ListingsComponent)
	},
	{
		path: 'property/:id',
		title: 'DM Real Estate | Property Details',
		loadComponent: () =>
			import('./pages/property-detail/property-detail.component').then((m) => m.PropertyDetailComponent)
	},
	{
		path: 'about',
		title: 'DM Real Estate | About',
		loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent)
	},
	{
		path: 'contact',
		title: 'DM Real Estate | Contact',
		loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent)
	},
	{
		path: 'profile',
		canActivate: [authGuard],
		title: 'DM Real Estate | Profile',
		loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent)
	},
	{
		path: 'admin',
		canActivate: [authGuard, adminGuard],
		title: 'DM Real Estate | Admin Dashboard',
		loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent)
	},
	{
		path: 'login',
		title: 'DM Real Estate | Login',
		loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
