import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OdjavaPageRoutingModule } from './odjava-routing.module';

import { OdjavaPage } from './odjava.page';

@NgModule({
  imports: [
    OdjavaPage,
    CommonModule,
    FormsModule,
    IonicModule,
    OdjavaPageRoutingModule
  ],
  declarations: []
})
export class OdjavaPageModule {}
