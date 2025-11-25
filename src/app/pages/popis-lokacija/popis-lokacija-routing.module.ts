import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PopisLokacijaPage } from './popis-lokacija.page';

const routes: Routes = [
  {
    path: '',
    component: PopisLokacijaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PopisLokacijaPageRoutingModule {}
