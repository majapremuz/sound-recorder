import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BrisanjeRacunaPageRoutingModule } from './brisanje-racuna-routing.module';

import { BrisanjeRacunaPage } from './brisanje-racuna.page';

@NgModule({
  imports: [
    BrisanjeRacunaPage,
    CommonModule,
    FormsModule,
    IonicModule,
    BrisanjeRacunaPageRoutingModule
  ],
  declarations: []
})
export class BrisanjeRacunaPageModule {}
