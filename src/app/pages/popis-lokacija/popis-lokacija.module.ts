import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PopisLokacijaPageRoutingModule } from './popis-lokacija-routing.module';

import { PopisLokacijaPage } from './popis-lokacija.page';


@NgModule({
  imports: [
    PopisLokacijaPage,
    CommonModule,
    FormsModule,
    IonicModule,
    PopisLokacijaPageRoutingModule
  ],
  declarations: []
})
export class PopisLokacijaPageModule {}
