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
  const savedLang = localStorage.getItem('appLanguage');
  this.selectedLang = savedLang ? savedLang : 'hr';

  const saved = localStorage.getItem('notificationsEnabled');
  this.notificationsEnabled = saved !== null ? JSON.parse(saved) : true;

  this.email = this.dataCtrl.getEmail() || 'Nepoznato';
}


  get currentLang() {
  return this.languages.find(l => l.code === this.selectedLang) || this.languages[0];
}

  async toggleNotifications(event: any) {
  this.notificationsEnabled = event.detail.checked;

  // Save state to storage
  localStorage.setItem('notificationsEnabled', JSON.stringify(this.notificationsEnabled));

  // Get stored token
  const token = localStorage.getItem('pushToken');

  if (!token) {
    console.warn('No push token found');
    return;
  }

  // Prepare form data (many PHP APIs require form data!)
  const formData = new FormData();
  formData.append('token', token);
  formData.append('active', this.notificationsEnabled ? '1' : '0');

  this.http.post('https://traffic-call.com/api/pushchange.php', formData)
    .subscribe({
      next: (response) => {
        console.log('API response:', response);
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
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
