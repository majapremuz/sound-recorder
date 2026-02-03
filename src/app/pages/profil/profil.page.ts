import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, TranslateModule]
})
export class ProfilPage implements OnInit {
  notificationsEnabled = true;
  locationModeAll = true;
  selectedLang = 'hr';
  email: string = '';

  languages = [
  { code: 'hr', name: 'Hrvatski', flag: 'assets/croatia.png' },
  { code: 'en', name: 'English', flag: 'assets/usa.png' },
  { code: 'de', name: 'Deutsch', flag: 'assets/germany.png' }
];

  constructor(
    private router: Router,
    private http: HttpClient,
    private dataCtrl: DataService
  ) { }

  ngOnInit() {
  const saved = localStorage.getItem('notificationsEnabled');
  this.notificationsEnabled = saved !== null ? JSON.parse(saved) : true;

  const savedLocationMode = localStorage.getItem('locationMode');
  this.locationModeAll = savedLocationMode
    ? savedLocationMode === 'all'
    : true;

  this.email = this.dataCtrl.getEmail() || 'Nepoznato';
}


  get currentLang() {
  return this.languages.find(l => l.code === this.selectedLang) || this.languages[0];
}

  async toggleNotifications(event: any) {
  this.notificationsEnabled = event.detail.checked;
  localStorage.setItem(
    'notificationsEnabled',
    JSON.stringify(this.notificationsEnabled)
  );

  const token = await this.dataCtrl.getAuthToken();
  if (!token) return;

  const formData = new FormData();
  formData.append('token', token);
  formData.append('active', this.notificationsEnabled ? '1' : '0');

  this.http.post('https://traffic-call.com/api/pushchange.php', formData)
    .subscribe();
}


onLocationModeChange(event: any) {
  this.locationModeAll = event.detail.checked;

  localStorage.setItem(
    'locationMode',
    this.locationModeAll ? 'all' : 'selected'
  );
}


  openLocations() {
    this.navigateTo('popis-lokacija');
  }

  changePassword() {
    this.navigateTo('promjena-lozinke');
  }

  changeLanguage() {
    this.navigateTo('izbor-jezika');
  }

  deleteAccount() {
    this.navigateTo('brisanje-racuna');
  }

  logout() {
    this.navigateTo('odjava');
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}


/*
[
    {
        "response": "Success"
    },
    {
        "response": "Success",
        "title": "hrvatski",
        "shortcut": "hr"
    },
    {
        "response": "Success",
        "title": "english",
        "shortcut": "en"
    }
]

*/
