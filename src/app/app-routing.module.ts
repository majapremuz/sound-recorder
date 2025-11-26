import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ReadyPageGuard } from './guards/ready-page.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canLoad: [ReadyPageGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'popis',
    loadChildren: () => import('./pages/popis/popis.module').then( m => m.PopisPageModule)
  },
  {
    path: 'profil',
    loadChildren: () => import('./pages/profil/profil.module').then( m => m.ProfilPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'password-reset',
    loadChildren: () => import('./pages/password-reset/password-reset.module').then( m => m.PasswordResetPageModule)
  },
  {
    path: 'popis-lokacija',
    loadChildren: () => import('./pages/popis-lokacija/popis-lokacija.module').then( m => m.PopisLokacijaPageModule)
  },
  {
    path: 'promjena-lozinke',
    loadChildren: () => import('./pages/promjena-lozinke/promjena-lozinke.module').then( m => m.PromjenaLozinkePageModule)
  },
  {
    path: 'izbor-jezika',
    loadChildren: () => import('./pages/izbor-jezika/izbor-jezika.module').then( m => m.IzborJezikaPageModule)
  },
  {
    path: 'brisanje-racuna',
    loadChildren: () => import('./pages/brisanje-racuna/brisanje-racuna.module').then( m => m.BrisanjeRacunaPageModule)
  },
  {
    path: 'odjava',
    loadChildren: () => import('./pages/odjava/odjava.module').then( m => m.OdjavaPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
