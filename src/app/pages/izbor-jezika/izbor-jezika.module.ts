import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IzborJezikaPageRoutingModule } from './izbor-jezika-routing.module';

import { IzborJezikaPage } from './izbor-jezika.page';

@NgModule({
  imports: [
    IzborJezikaPage,
    CommonModule,
    FormsModule,
    IonicModule,
    IzborJezikaPageRoutingModule
  ],
  declarations: []
})
export class IzborJezikaPageModule {}
