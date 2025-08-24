import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PopisPage } from './popis.page';

const routes: Routes = [
  {
    path: '',
    component: PopisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PopisPageRoutingModule {}
