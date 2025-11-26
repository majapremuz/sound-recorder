import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IzborJezikaPage } from './izbor-jezika.page';

const routes: Routes = [
  {
    path: '',
    component: IzborJezikaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IzborJezikaPageRoutingModule {}
