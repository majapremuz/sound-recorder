import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PromjenaLozinkePageRoutingModule } from './promjena-lozinke-routing.module';

import { PromjenaLozinkePage } from './promjena-lozinke.page';

@NgModule({
  imports: [
    PromjenaLozinkePage,
    CommonModule,
    FormsModule,
    IonicModule,
    PromjenaLozinkePageRoutingModule
  ],
  declarations: []
})
export class PromjenaLozinkePageModule {}
