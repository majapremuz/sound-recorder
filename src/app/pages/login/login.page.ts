import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertType, DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { navigate } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import * as sha1 from 'sha1';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule]
})
export class LoginPage implements OnInit {
  isLogin: boolean = true;
  loginEmail = '';
  loginPassword = '';
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerRepeat = '';
  showPassword = false;
  wrongPassword: boolean = false;
  passwordField: any = 'password';

  constructor(
    private router: Router, 
    private toastCtrl: ToastController,
    private http: HttpClient,
    private dataCtrl: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  toggleMode(mode: 'login' | 'register') {
    this.isLogin = (mode === 'login');
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  onSubmit() {
  if (this.isLogin) {
    if (!this.loginEmail || !this.loginPassword) {
      this.showToast('Unesite email i lozinku.');
      return;
    }
    this.login();
  } else {
    if (!this.registerEmail || !this.registerPassword) {
      this.showToast('Unesite email i lozinku.');
      return;
    }
    if (this.registerPassword !== this.registerRepeat) {
      this.showToast('Lozinke se ne poklapaju.');
      return;
    }
    this.register();
  }
}

  async register() {
  const url = 'https://traffic-call.com/api/register.php';

  const firebaseToken = await this.dataCtrl.loadFirebaseToken();

  const body = {
    username: sha1(this.registerUsername),
    email: sha1(this.registerEmail),
    password: sha1(this.registerPassword),
    pushToken: firebaseToken || ''
  };

  console.log('Registering with', body);

  this.http.post(url, body, { responseType: 'text' }).subscribe({
    next: (raw) => {
      console.log('Raw server response:', raw);

      const jsonStart = raw.indexOf('{');
      if (jsonStart === -1) {
        this.showToast('Neispravan odgovor sa servera.');
        return;
      }

      let res: any;
      try {
        res = JSON.parse(raw.slice(jsonStart));
      } catch (e) {
        console.error('JSON parse error:', e);
        this.showToast('Neispravan JSON odgovor sa servera.');
        return;
      }

      console.log('Parsed response:', res);

      if (res.status === true) {
        const lastlogin = res.lastlogin;
        const username = sha1(this.registerEmail);

        this.dataCtrl.setAuthData(username, lastlogin);

        this.showToast('Registracija uspješna! Možete se prijaviti.');
        this.isLogin = true;
      } else {
        this.showToast(res.message || 'Registracija nije uspjela.');
      }
    },
    error: (err) => {
      console.error('Register error:', err);
      this.showToast('Greška prilikom registracije. Pokušajte ponovno.');
    }
  });
}

login() {
  const body = {
    username: sha1(this.registerEmail),
    password: sha1(this.registerPassword)
  };

  this.http.post('https://traffic-call.com/api/login.php', body, { responseType: 'text' })
    .subscribe({
      next: (raw) => {
        const res = JSON.parse(raw.slice(raw.indexOf('{')));
        if (res.status === true) {
          // dobivaš lastlogin od servera
          const lastlogin = res.lastlogin;
          this.dataCtrl.setAuthData(this.registerEmail, lastlogin); // generira token
          this.showToast('Prijava uspješna!');
        } else {
          this.showToast(res.message || 'Prijava nije uspjela.');
        }
      }
    });
}

togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}

  cancel() {
    this.router.navigate(['/home']);
  }

  navigateTo(page: string) {
  this.router.navigate([`/${page}`]);
}

  openPasswordReset() {
    this.router.navigate(['/password-reset']);
  }

}


