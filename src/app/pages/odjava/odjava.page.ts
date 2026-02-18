import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { App } from '@capacitor/app';

import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-odjava',
  templateUrl: './odjava.page.html',
  styleUrls: ['./odjava.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class OdjavaPage {

  constructor(
    private authService: AuthService,
    private dataCtrl: DataService,
    private storage: Storage,
    private router: Router
  ) {}

  async logout() {
  await this.authService.fullLogout();
  this.authService.setLoggedIn(false);
  App.exitApp();
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
