import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromjenaLozinkePage } from './promjena-lozinke.page';

const routes: Routes = [
  {
    path: '',
    component: PromjenaLozinkePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromjenaLozinkePageRoutingModule {}
