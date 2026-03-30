import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as sha1 from 'sha1';
import { eye, eyeOff } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Subscription, firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule]
})
export class LoginPage implements OnInit {
  isLoginMode = true;   
  isAuthenticated = false;
  loginEmail = '';
  loginUsername = '';
  loginPassword = '';
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerRepeat = '';
  showLoginPassword = false;
  showRegisterPassword = false;
  showRepeatPassword = false;
  wrongPassword: boolean = false;
  passwordField: any = 'password';
  authSub?: Subscription;

  constructor(
    private router: Router, 
    private toastCtrl: ToastController,
    private http: HttpClient,
    private dataService: DataService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    addIcons({
    eye,
    'eye-off': eyeOff
  });
  }

  async ngOnInit() {
   this.authSub = this.authService.isLoggedIn$().subscribe(state => {
    this.isAuthenticated = state;
  });
  const lang = await this.dataService.getSavedLanguage() || 'hr';
  this.translate.use(lang);
  console.log('Language applied:', lang);
  }

  toggleMode(mode: 'login' | 'register') {
  this.isLoginMode = mode === 'login';

  this.loginUsername = '';
  this.loginPassword = '';
  this.registerUsername = '';
  this.registerEmail = '';
  this.registerPassword = '';
  this.registerRepeat = '';
}


  async showToast(message: string,color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    toast.present();
  }

  async onSubmit() {
  if (this.isLoginMode) {
    this.login();
    return;
  }

  if (this.registerPassword !== this.registerRepeat) {
    const message = await firstValueFrom(this.translate.get('PASSWORD_MISSMATCH'));
    this.showToast(message, 'danger');
    return;
  }

  this.register();
}

  async register() {
  const url = 'https://traffic-call.com/api/register.php';
  let firebaseToken = this.dataService.pushToken;

  console.log('Using token:', firebaseToken);
const body = {
  username: this.registerUsername,
  email: this.registerEmail,
  password: this.registerPassword,
  token: firebaseToken
};

console.log('Registering with:', body);

this.http.post(url, body, {
  headers: { 'Content-Type': 'application/json' },
  responseType: 'text'
}).subscribe({
  next: async (raw) => {
    console.log('RAW REGISTER RESPONSE:', raw);

    if (!raw || raw.trim() === '') {
      const message = await firstValueFrom(this.translate.get('NO_RESPONSE'));
      this.showToast(message, 'error');
      return;
    }

    let res: any;

    try {
      res = JSON.parse(raw);
    } catch (e) {
      console.error('JSON parse error:', e, raw);
      const message = await firstValueFrom(this.translate.get('NO_RESPONSE'));
      this.showToast(message, 'error');
      return;
    }

    if (Array.isArray(res) && res.length > 0 && res[0].response === "Success") {
      const lastlogin = res[0].lastlogin;

      await this.dataService.setAuthData(
        this.registerUsername,
        this.registerEmail,
        lastlogin
      );

      const savedLang = await this.dataService.getSavedLanguage();
      const langToUse = savedLang || 'hr';

      await firstValueFrom(this.translate.use(langToUse));
      this.translate.setDefaultLang(langToUse);
 
      const message = await firstValueFrom(this.translate.get('REGISTER_SUCCESS'));
      this.showToast(message, 'success');
      this.isLoginMode = true;
      this.isAuthenticated = true;
      this.authService.setLoggedIn(true);
    } else {
      const message = await firstValueFrom(this.translate.get('REGISTER_ERROR'));
      this.showToast(res[0]?.message || message, 'error');
    }
  },
  error: (err) => {
    (async () => {
    console.error('REGISTER ERROR:', err);
    const message = await firstValueFrom(this.translate.get('REGISTER_ERROR'));
    this.showToast(message, 'error');
    })();
  }
});
}

login() {
  const body =
    `username=${encodeURIComponent(sha1(this.loginUsername))}` +
    `&password=${encodeURIComponent(sha1(this.loginPassword))}`;

  console.log('Logging in with:', body);

  this.http.post('https://traffic-call.com/api/login.php', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'text'
  }).subscribe({
    next: async (raw) => {
      console.log('RAW LOGIN RESPONSE:', raw);

      if (!raw || raw.trim() === '') {
        const message = await firstValueFrom(this.translate.get('NO_RESPONSE'));
        this.showToast(message, 'error');
        return;
      }

      let res: any;
      try {
        res = JSON.parse(raw);
      } catch (e) {
        console.error('JSON parse error:', e, raw);
        const message = await firstValueFrom(this.translate.get('NO_RESPONSE'));
        this.showToast(message, 'error');
        return;
      }

      if (Array.isArray(res) && res.length > 0 && res[0].response === "Success") {
        const lastlogin = res[0].lastlogin;
        const email = res[0].email || this.loginUsername;

        await this.dataService.setAuthData(
          this.loginUsername,
          email,
          lastlogin
        );

        const savedLang = await this.dataService.getSavedLanguage();
        const langToUse = savedLang || 'hr';

        await firstValueFrom(this.translate.use(langToUse));
        this.translate.setDefaultLang(langToUse);

        const message = await firstValueFrom(this.translate.get('LOGIN_SUCCESS'));
        this.showToast(message, 'success');
        this.router.navigate(['/home']);
      } else {
        const message = await firstValueFrom(this.translate.get('LOGIN_ERROR'));
        this.showToast(res[0]?.message || message, 'error');
      }
    },
    error: (err) => {
      (async () => {
      console.error('LOGIN ERROR:', err);
      const message = await firstValueFrom(this.translate.get('LOGIN_ERROR'));
      this.showToast(message, 'error');
      })();
    }
  });
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
