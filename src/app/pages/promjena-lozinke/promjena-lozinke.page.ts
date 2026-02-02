import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  async changePassword() {
    if (!this.newPasswordValue || !this.repeatPasswordValue) {
      this.showToast('Molimo unesite obje lozinke', 'danger');
      return;
    }

    if (this.newPasswordValue !== this.repeatPasswordValue) {
      this.showToast('Lozinke se ne podudaraju', 'danger');
      return;
    }

    try {
      await this.authService.changePassword(this.newPasswordValue);
      this.showToast('Lozinka uspješno promijenjena', 'success');
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
