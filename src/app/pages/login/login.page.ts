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

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  isLogin: boolean = true;
  emailValue = '';
  passwordValue = '';
  repeatValue = '';
  showPassword = false;
  wrongPassword: boolean = false;

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
    if (!this.emailValue || !this.passwordValue) {
      this.showToast('Unesite email i lozinku.');
      return;
    }

    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

  register() {
  const url = ``;

  const body = {
    user_email: this.emailValue,
    user_password: this.passwordValue,
    user_phone: '1234567890',
    user_firstname: 'Maja',
    user_lastname: 'P',
    user_platform: "",
    user_company: 17,
    user_city: "",
    user_zip: "",
    user_address: "",
    user_taxi_driver: ""
  };

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

      if (res.status && res.message !== 'no permission') {
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
  this.authService.login(this.emailValue, this.passwordValue, 17, 'all').subscribe({
    next: () => {
      this.authService.getUser().then(user => {
        console.log("Fetched user info:", user);
        
        this.dataCtrl.translateWord("Uspješno ste se prijavili").then(word => {
          this.dataCtrl.showToast(word, AlertType.Success);
        });

        this.cancel();
        this.dataCtrl.hideLoader();
      }).catch(err => {
        console.error("Get user failed:", err);
        this.dataCtrl.showToast("Nije moguće dohvatiti korisničke podatke", AlertType.Warning);
      });
    },
    error: (err: any) => {
      this.dataCtrl.hideLoader();
      if (err === 'Pogrešan email ili lozinka.' || err.error?.error === 'invalid_grant') {
        this.dataCtrl.translateWord('Krivi email ili lozinka').then(word => {
          this.dataCtrl.showToast(word, AlertType.Warning);
        });
        this.wrongPassword = true;
      } else {
        console.log(err);
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


