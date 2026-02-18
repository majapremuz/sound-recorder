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
  this.authService.deleteAccount().subscribe({
    next: () => {
      this.router.navigate(['/login'], { replaceUrl: true });
    },
    error: err => {
      console.error('Delete failed:', err);
    }
  });
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
