import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { eye, eyeOff } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-promjena-lozinke',
  templateUrl: './promjena-lozinke.page.html',
  styleUrls: ['./promjena-lozinke.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule]
})
export class PromjenaLozinkePage implements OnInit {

  newPasswordValue: string = '';
  repeatPasswordValue: string = '';
  showNewPassword: boolean = false;
  showRepeatNewPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {
      addIcons({
      eye,
      'eye-off': eyeOff
    });
    }

  ngOnInit() {}

  async changePassword() {
    if (!this.newPasswordValue || !this.repeatPasswordValue) {
      console.log( this.newPasswordValue, this.repeatPasswordValue);
      const message = await this.translate.get('PASSWORD_EMPTY').toPromise();
      this.showToast(message, 'danger');
      return;
    }

    if (this.newPasswordValue !== this.repeatPasswordValue) {
      const message = await this.translate.get('PASSWORD_MISSMATCH').toPromise();
      this.showToast(message, 'danger');
      return;
    }

    try {
      await this.authService.changePassword(this.newPasswordValue);
      this.showToast('{{PASSWORD_CHANGED | translate}}', 'success');
      this.newPasswordValue = '';
      this.repeatPasswordValue = '';
      this.router.navigate(['/profil']);
    } catch (err) {
      this.showToast(String(err), 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color
    });
    toast.present();
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
