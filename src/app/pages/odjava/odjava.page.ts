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
    try {
      // Clear Ionic Storage
      await this.storage.remove('auth_token');
      await this.storage.remove('username');
      await this.storage.remove('email');
      await this.storage.remove('lastlogin');

      // Clear localStorage leftovers
      localStorage.removeItem('auth_token');
      localStorage.removeItem('email');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');

      // Reset services
      this.authService.setLoggedIn(false);
      this.dataCtrl.clearAuthData?.();

      console.log('LOGOUT SUCCESS');

      App.exitApp();

    } catch (err) {
      console.error('LOGOUT ERROR:', err);
      App.exitApp();
    }
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
