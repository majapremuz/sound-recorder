import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PopisPageRoutingModule } from './popis-routing.module';

import { PopisPage } from './popis.page';

@NgModule({
  imports: [
    PopisPage,
    CommonModule,
    FormsModule,
    IonicModule,
    PopisPageRoutingModule
  ],
  declarations: []
})
export class PopisPageModule {}
