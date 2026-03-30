import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform, IonRouterOutlet } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
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
  isAppReady = false;

  private defaultHrTranslations = { 
        "AUDIO_SEND": "Audio poslan!",
        "AUDIO_SEND_ERROR": "Slanje audio fajla nije uspjelo.",
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
        "LOGIN_SUCCESS": "Prijava uspješna!",
        "LOGIN_ERROR": "Prijava neuspješna, molimo Vas da proverite Vasu e-mail adresu i lozinku.",
        "REGISTER_TITLE": "Registracija",
        "REGISTER": "Registriraj se",
        "REGISTER_SUCCESS": "Registracija uspješna!",
        "REGISTER_ERROR": "Registracija neuspješna, molimo Vas da proverite Vasu e-mail adresu i lozinku.",
        "EMAIL": "E-mail",
        "VALID_EMAIL_REQUIRED": "Unesite pravilnu e-mail adresu.",
        "USERNAME": "Korisničko ime",
        "USERNAME_ERROR": "Korisničko ime je obavezno.",
        "PASSWORD": "Lozinka",
        "PASSWORD_MISMATCH": "Lozinke se ne podudaraju.",
        "REPEAT_PASSWORD": "Ponovi lozinku",
        "PASSWORD_ERROR": "Lozinka je obavezna.",
        "FORGOT_PASSWORD": "Kliknite ovdje ako ste zaboravili Vašu lozinku",
        "CHANGE_PASSWORD": "Promjena lozinke",
        "CHANGE_PASSWORD_BUTTON": "Promijeni lozinku",
        "PASSWORD_EMPTY": "Molimo Vas da unesete obje lozinke.",
        "PASSWORD_CHANGED": "Lozinka je uspješno promjenjena.",
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
        "DELETE_HEADER": "Brisanje računa",
        "NO_RESPONSE": "Server nije vratio odgovor.",
        "RESET_LINK_SEND": "Resetni link je poslan na Vasu e-mail adresu.",
        "RESET_LINK_ERROR": "Greška, molimo Vas da proverite Vasu e-mail adresu."
      };

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
  await this.platform.ready();
  await this.dataService.initStorage();

  // 🔥 STEP 1: IMMEDIATE fallback (sync, no waiting)
  this.translate.setTranslation('hr', this.defaultHrTranslations, true);
  this.translate.setDefaultLang('hr');
  this.translate.use('hr');

  // 🔥 STEP 2: load API translations
  await this.loadApiTranslations();

  // 🔥 STEP 3: apply user language
  const savedLang = await this.dataService.getSavedLanguage();
  const langToUse = savedLang || 'hr';
  this.translate.use(langToUse);

  await this.bootstrap();
  this.isAppReady = true;
}

  private async bootstrap() {
  this.dataService.authTokenChanges$.subscribe(async token => {
    this.authService.setLoggedIn(!!token);

    console.log("Auth token updated:", token);

    if (token) {
      await this.loadApiTranslations();

      const savedLang = await this.dataService.getSavedLanguage();
      const langToUse = savedLang || 'hr';

      await firstValueFrom(this.translate.use(langToUse));
      this.translate.setDefaultLang(langToUse);

      console.log('Language reapplied after login:', langToUse);
    }
  });

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
  await this.dataService.ensureStorageReady();

  const key = await this.dataService.getLanguageKey();
  const savedLang = await this.dataService.getStorageItem(key);

  console.log('Loaded language from storage:', savedLang);
  return savedLang || 'hr'; // fallback
}

  private async loadApiTranslations(): Promise<void> {
    try {
      const langs = await firstValueFrom(this.languageService.getLanguages()).catch(() => []);
      let translations: Record<string, any> = {};

      if (langs.length) {
        translations = await firstValueFrom(
          this.languageService.getTranslations(langs)
        ).catch(() => ({}));
      }

      this.translate.setTranslation('hr', this.defaultHrTranslations, true);

      Object.entries(translations).forEach(([lang, values]) => {
        this.translate.setTranslation(lang, values as any, true);
      });

      const key = await this.dataService.getLanguageKey();
      //const currentLang = await this.storage.get(key);
      //console.log('Translations loaded for:', currentLang);

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
