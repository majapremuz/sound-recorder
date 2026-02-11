import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data.service';
import { LocationService } from 'src/app/services/location.service';
import {LanguageService, Language} from 'src/app/services/language.service';
import { TranslateService } from '@ngx-translate/core';

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
  selectedLang = this.translateService.currentLang || 'hr';;
  languages: Language[] = [];
  email: string = '';
  selectedCityCount = 0;
  selectedCities: string[] = [];
  selectedCitiesPreview = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private dataCtrl: DataService,
    private locationService: LocationService,
    private languageService: LanguageService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
  const saved = localStorage.getItem('notificationsEnabled');
  this.notificationsEnabled = saved !== null ? JSON.parse(saved) : true;

  this.dataCtrl.emailChanges$.subscribe(email => {
    this.email = email || 'Nepoznato';
  });

  this.languageService.getLanguages().subscribe({
  next: (langs) => {
    this.languages = langs;
  },
  error: (err) => {
    console.error('Error loading languages', err);
  }
  });

  const savedLocationMode = localStorage.getItem('locationMode');
  this.locationModeAll = savedLocationMode
    ? savedLocationMode === 'all'
    : true;

  const cities = JSON.parse(localStorage.getItem('selectedCities') || '[]');
  this.locationService.selectedCities$.subscribe(cities => {
  this.selectedCities = cities;
  this.selectedCityCount = cities.length;
  this.buildPreview();
  });
  ;
}

buildPreview() {
  if (this.selectedCities.length <= 2) {
    this.selectedCitiesPreview = this.selectedCities.join(', ');
  } else {
    const firstTwo = this.selectedCities.slice(0, 2).join(', ');
    this.selectedCitiesPreview = `${firstTwo} + ${this.selectedCities.length - 2}`;
  }
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

  const token = await this.dataCtrl.loadFirebaseToken();
  if (!token) return;

  console.log('notificationsToken:', token);

  const formData = new FormData();
  formData.append('token', token);
  formData.append('active', this.notificationsEnabled ? '1' : '0');

  this.http.post('https://traffic-call.com/api/pushchange.php', formData)
    .subscribe();
}


onLocationModeChange(event: any) {
  this.locationModeAll = event.detail.checked;

  if (this.locationModeAll) {
    // ALL mode
    localStorage.setItem('locationMode', 'all');
    localStorage.removeItem('selectedCities');

    this.selectedCities = [];
    this.selectedCityCount = 0;
    this.selectedCitiesPreview = '';
  } else {
    // SELECTED mode
    localStorage.setItem('locationMode', 'selected');
  }
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
