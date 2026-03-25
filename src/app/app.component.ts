import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform, IonRouterOutlet } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

import { TranslateConfigService } from './services/translate-config.service';
import { ControllerService } from './services/controller.service';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class AppComponent {

  @ViewChild(IonRouterOutlet, { static: false }) routerOutlet: IonRouterOutlet | undefined;

  constructor(
    private router: Router,
    public platform: Platform,
    public translateConfigService: TranslateConfigService,
    public contrCtrl: ControllerService,
    public dataService: DataService,
    private translate: TranslateService, 
    private authService: AuthService,
    private storage: Storage,
    private languageService: LanguageService
  ) {}

  async ngOnInit() { 
    await this.bootstrap();
  }

  private async bootstrap() {
    await this.platform.ready();
    await this.dataService.initStorage(); 
    await this.authService.syncLoginStateFromStorage();

    this.dataService.authTokenChanges$.subscribe(token => {
      this.authService.setLoggedIn(!!token);
      if (token) {
        console.log("Auth token updated:", token);
      }
    });

    const lang = await this.initLanguage();
    await this.loadApiTranslations();

    await this.setReadyPage();
  }

  private async setReadyPage() {
    console.log('setReadyPage');

    if (this.platform.is('hybrid')) {
      try {
        await SplashScreen.hide();
        await StatusBar.show();
        await this.initNotifications();
      } catch (e) {
        console.warn('Error initializing mobile plugins', e);
      }
    }

    this.contrCtrl.setReadyPage();
  }

  private async initLanguage(): Promise<string> {
    const savedLang = await this.storage.get('selectedLang');
    if (savedLang) {
      this.translate.setDefaultLang(savedLang);
      return savedLang;
    }

    let deviceLang = 'hr';

    try {
      if (this.platform.is('hybrid')) {
        const info = await Device.getLanguageCode();
        deviceLang = info.value?.toLowerCase() ?? 'en';
      } else {
        const browserLang = this.translate.getBrowserLang();
        if (browserLang) deviceLang = browserLang;
      }
    } catch (e) {
      console.warn('Error getting device language', e);
    }

    const finalLang = deviceLang.startsWith('hr') ? 'hr' : 'en';
    this.translate.setDefaultLang(finalLang);
    await this.storage.set('selectedLang', finalLang);
    return finalLang;
  }

  private async loadApiTranslations() {
    try {
      const langs = await firstValueFrom(this.languageService.getLanguages()).catch(() => []);
      let translations: Record<string, any> = {};

      if (langs.length) {
        translations = await firstValueFrom(
          this.languageService.getTranslations(langs)
        ).catch(() => ({}));
      }

      const defaultHrTranslations = { 
        "LANGUAGE_SELECTION": "Izbor jezika",
        "CONFIRM_LANGUAGE": "Potvrdi izbor jezika",
        "HOME": "Početni ekran",
        "LIST": "Popis objava",
        "PROFILE": "Korisnički profil",
        "NOT_LOGGED": "Poštovani, za slanje prometnog izvještaja potrebno je prijaviti se u aplikaciju.",
        "LOGIN": "Prijava i registracija",
        "NOTIFICATIONS": "Primanje notifikacija",
        "OFF": "isključeno",
        "ON": "uključeno",
        "LOCATIONS": "Određivanje lokacija",
        "ALL": "sve lokacije",
        "LOCATIONS_LIST": "Popis lokacija",
        "PASSWORD_CHANGE": "Promjena lozinke",
        "LANGUAGE_CHANGE": "Promjena jezika",
        "DELETE_ACCOUNT": "Obriši korisnički račun",
        "DELETE_": "Brisanje korisničkog računa",
        "DELETE_ACCOUNT_TEXT": "Ukoliko želite obrisati korisnički račun u aplikaciji, molimo Vas da potvrdite.",
        "LOGOUT": "Odjava",
        "LOGOUT_TITLE": "Odjava iz aplikacije",
        "LOGOUT_TEXT": "Ukoliko se želite odjaviti iz aplikacije, molimo Vas da to potvrdite.",
        "LOGOUT_BUTTON": "Odjavi se",
        "LOGIN_TITLE": "Prijava",
        "LOGIN_": "Prijavi se",
        "REGISTER_TITLE": "Registracija",
        "REGISTER": "Registriraj se",
        "EMAIL": "E-mail",
        "VALID_EMAIL_REQUIRED": "Unesite pravilnu e-mail adresu.",
        "USERNAME": "Korisničko ime",
        "USERNAME_ERROR": "Korisničko ime je obavezno.",
        "PASSWORD": "Lozinka",
        "REPEAT_PASSWORD": "Ponovi lozinku",
        "PASSWORD_ERROR": "Lozinka je obavezna.",
        "FORGOT_PASSWORD": "Kliknite ovdje ako ste zaboravili Vašu lozinku",
        "CHANGE_PASSWORD": "Promjena lozinke",
        "CHANGE_PASSWORD_BUTTON": "Promijeni lozinku",
        "PASSWORD_RESET": "Izgubljena lozinka",
        "PASSWORDS_DO_NOT_MATCH": "Lozinke se ne podudaraju.",
        "SEND_RESET_LINK": "Pošalji na e-mail",
        "ENTER_VALID_PASSWORD": "Unesite pravilnu lozinku.",
        "OLD_PASSWORD": "Stara lozinka",
        "NEW_PASSWORD": "Nova lozinka",
        "REPEAT_NEW_PASSWORD": "Ponovi novu lozinku",
        "CONFIRM_DELETE_ACCOUNT": "Da li ste sigurni da želite obrisati Vaš korisnički račun?",
        "CANCEL": "Otkaži",
        "DELETE": "Obriši",
        "DELETE_HEADER": "Brisanje računa"
      };

      this.translate.setTranslation('hr', defaultHrTranslations, true);

      Object.entries(translations).forEach(([lang, values]) => {
        this.translate.setTranslation(lang, values as any, true);
      });

      const currentLang = await this.storage.get('selectedLang') || 'hr';
      //this.translate.setDefaultLang('hr');
      this.translate.use(currentLang || 'hr');

      console.log('Translations loaded for:', currentLang);

    } catch (err) {
      console.error('Translation loading error:', err);
    }
  }

  private async initNotifications() {
    if (!this.platform.is('hybrid')) {
      console.log('Skipping notifications in browser');
      return;
    }

    try {
      const perm = await FirebaseMessaging.requestPermissions();
      console.log('Push permission:', perm);

      if (perm.receive !== 'granted') {
        console.warn('Push permission not granted');
        return;
      }

      const { token } = await FirebaseMessaging.getToken();
      console.log('FCM Token:', token);

      if (token) {
        await this.dataService.savePushToken(token);
      } else {
        console.warn('No FCM token received');
      }

      await this.addListeners();

    } catch (err) {
      console.error('initNotifications error:', err);
    }
  }

  private async addListeners() {
    await FirebaseMessaging.addListener('notificationReceived', notification => {
      console.log('Push received:', notification);
    });

    await FirebaseMessaging.addListener('notificationActionPerformed', notification => {
      console.log('Push action:', notification);
    });
  }

}
