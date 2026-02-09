import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';  
import { IonicModule, AlertController} from '@ionic/angular';  
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-brisanje-racuna',
  templateUrl: './brisanje-racuna.page.html',
  styleUrls: ['./brisanje-racuna.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class BrisanjeRacunaPage implements OnInit {

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private authService: AuthService,
    private dataService: DataService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  async onDeleteAccount() {
  // Fetch translations
  const [message, cancelText, deleteText, headerText] = await Promise.all([
    this.translateService.get('CONFIRM_DELETE_ACCOUNT').toPromise(),
    this.translateService.get('CANCEL').toPromise(),
    this.translateService.get('DELETE').toPromise(),
    this.translateService.get('DELETE_HEADER').toPromise()
  ]);

  const alert = await this.alertCtrl.create({
    header: headerText,
    message: message,
    buttons: [
      { text: cancelText, role: 'cancel' },
      {
        text: deleteText,
        cssClass: 'danger',
        handler: () => {
          this.confirmDelete();
        }
      }
    ]
  });

  await alert.present();
}


  async confirmDelete() {
  try {
    const regToken = await this.dataService.getStorageItem('register_token'); // USE REGISTER TOKEN
    if (!regToken) {
      console.error('No registration token available to delete account.');
      return;
    }

    this.authService.deleteAccount(regToken).subscribe({
      next: async (res) => {
        if (res?.response === 'Success') {
          await this.authService.fullLogout();
          this.router.navigate(['/login'], { replaceUrl: true });
        } else {
          console.error('Server refused delete:', res);
        }
      },
      error: (err) => {
        console.error('Delete failed:', err);
      }
    });
  } catch (err) {
    console.error('Error during delete:', err);
  }
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
