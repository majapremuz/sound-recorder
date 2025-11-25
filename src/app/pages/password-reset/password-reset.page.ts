import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PasswordResetPage {

  emailValue: string = '';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async sendResetLink() {
    if (!this.emailValue) return;

    this.http.post('https://your-server/api/forgot-password', {
      email: this.emailValue
    }).subscribe({
      next: async () => {
        const t = await this.toastCtrl.create({
          message: 'Link za reset lozinke poslan!',
          duration: 3000,
          color: 'success'
        });
        t.present();
      },
      error: async () => {
        const t = await this.toastCtrl.create({
          message: 'Greška — provjerite e-mail.',
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
