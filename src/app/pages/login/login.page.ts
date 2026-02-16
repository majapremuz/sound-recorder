import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service'
import { TranslateModule } from '@ngx-translate/core';
import * as sha1 from 'sha1';
import { eye, eyeOff } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule]
})
export class LoginPage implements OnInit {
  isLoggedIn = false;
  loginEmail = '';
  loginUsername = '';
  loginPassword = '';
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerRepeat = '';
  showPassword = false;
  wrongPassword: boolean = false;
  passwordField: any = 'password';
  authSub?: Subscription

  constructor(
    private router: Router, 
    private toastCtrl: ToastController,
    private http: HttpClient,
    private dataService: DataService,
    private authService: AuthService
  ) {
    addIcons({
    eye,
    'eye-off': eyeOff
  });
  }

  async ngOnInit() {
   this.authSub = this.authService.isLoggedIn$().subscribe(state => {
  this.isLoggedIn = state;
  });
  }

  toggleMode(mode: 'login' | 'register') {
  this.isLoggedIn = mode === 'login';

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

  onSubmit() {
  if (this.isLoggedIn) {
    this.login();
    return;
  }

  if (this.registerPassword !== this.registerRepeat) {
    this.showToast('Lozinke se ne poklapaju.');
    return;
  }

  this.register();
}

  async register() {
  const url = 'https://traffic-call.com/api/register.php';
  const firebaseToken = await this.dataService.loadFirebaseToken();

  const body = new HttpParams()
    .set('username', this.registerUsername)
    .set('email', this.registerEmail)
    .set('password',this.registerPassword)
    .set('token', firebaseToken || '');

  this.http.post(url, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'text'
  }).subscribe({
    next: async (raw) => {
      console.log('RAW REGISTER RESPONSE:', raw); 

      if (!raw || raw.trim() === '') {
        this.showToast('Server nije vratio odgovor.');
        return;
      }

      let res: any;

try {
  const jsonStart = raw.indexOf('[');
  if (jsonStart === -1) {
    throw new Error('No JSON found');
  }

  const jsonString = raw.substring(jsonStart);
  res = JSON.parse(jsonString);
} catch (e) {
  console.error('JSON parse error:', e, raw);
  this.showToast('Greška u odgovoru servera.');
  return;
}


      if (Array.isArray(res) && res.length > 0 && res[0].response === "Success") {
  const lastlogin = res[0].lastlogin;

      await this.dataService.setAuthData(
        this.registerUsername,
        this.registerEmail,
        lastlogin
      );

      this.showToast('Registracija uspješna! Možete se prijaviti.', 'success');
      this.isLoggedIn = true;
      console.log('SET AUTH CALLED FROM:', new Error().stack);
      this.authService.setLoggedIn(true);
    } else {
        this.showToast(res[0]?.message || 'Registracija nije uspjela.');
      }
    },
    error: (err) => {
      console.error('REGISTER ERROR:', err);
      if (err.status === 0) {
        this.showToast('Ne može se povezati sa serverom (CORS ili mreža).', 'error');
      } else {
        this.showToast('Greška prilikom registracije.', 'error');
      }
    }
  });
}

login() {
  const body = new HttpParams()
    .set('username', sha1(sha1(this.loginUsername)))
    .set('password', sha1(sha1(this.loginPassword)));

  this.http.post('https://traffic-call.com/api/login.php', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'text'
  }).subscribe({
    next: async (raw) => {
      console.log('RAW LOGIN RESPONSE:', raw); 

      if (!raw || raw.trim() === '') {
        this.showToast('Server nije vratio odgovor.', 'error');
        return;
      }

      let res: any;
      try {
        res = JSON.parse(raw);
      } catch (e) {
        console.error('JSON parse error:', e, raw);
        this.showToast('Greška u odgovoru servera.', 'error');
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
      this.showToast('Prijava uspješna!', 'success');
      this.router.navigate(['/home']);
      console.log('SET AUTH CALLED FROM:', new Error().stack);
      } else {
        this.showToast(res[0]?.message || 'Pogrešni podaci.', 'error');
      }
    },
    error: (err) => {
      console.error('LOGIN ERROR:', err);
      if (err.status === 0) {
        this.showToast('Ne može se povezati sa serverom (CORS ili mreža).');
      } else {
        this.showToast('Greška prilikom prijave.');
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
