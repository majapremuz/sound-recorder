import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule]
})
export class PasswordResetPage {

  emailValue: string = '';
  isAuthenticated = false;
  authSub?: Subscription

  async ngOnInit() {
   this.authSub = this.authService.isLoggedIn$().subscribe(state => {
    this.isAuthenticated = state;
  });
  }

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  async sendResetLink() {
    if (!this.emailValue) return;

    this.http.post('https://traffic-call.com/api/mailPassword.php', {
      mail: this.emailValue
    }).subscribe({
      next: async () => {
        const t = await this.toastCtrl.create({
          message: await firstValueFrom(this.translate.get('RESET_LINK_SEND')),
          duration: 3000,
          color: 'success'
        });
        t.present();
      },
      error: async () => {
        const t = await this.toastCtrl.create({
          message: await firstValueFrom(this.translate.get('RESET_LINK_ERROR')),
          duration: 3000,
          color: 'danger'
        });
        t.present();
      }
    });
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
