import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, TranslateModule]
})
export class ProfilPage implements OnInit {
  notificationsEnabled = true;
  selectedLang = 'hr';

  languages = [
  { code: 'hr', name: 'Hrvatski', flag: 'assets/croatia.png' },
  { code: 'en', name: 'English', flag: 'assets/usa.png' },
  { code: 'de', name: 'Deutsch', flag: 'assets/germany.png' }
];

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
  const savedLang = localStorage.getItem('appLanguage');
  this.selectedLang = savedLang ? savedLang : 'hr';

  const saved = localStorage.getItem('notificationsEnabled');
  this.notificationsEnabled = saved !== null ? JSON.parse(saved) : true;
}


  get currentLang() {
  return this.languages.find(l => l.code === this.selectedLang) || this.languages[0];
}

  async toggleNotifications() {
  // Flip the state first
  this.notificationsEnabled = !this.notificationsEnabled;

  // Save to storage
  localStorage.setItem('notificationsEnabled', JSON.stringify(this.notificationsEnabled));

  // Make sure permissions are granted
  const permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive !== 'granted') {
    await PushNotifications.requestPermissions();
  }

  // Get stored token (from registration step)
  const token = localStorage.getItem('pushToken');

  if (token) {
    await this.http.post(
      'https://traffic-call.com/api/pushchange.php',
      { token, active: this.notificationsEnabled ? 1 : 0 }
    ).toPromise();
  }

  console.log('Notifications ' + (this.notificationsEnabled ? 'enabled' : 'disabled'));
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
