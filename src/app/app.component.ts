import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { TranslateConfigService } from './services/translate-config.service';
import { ControllerService } from './services/controller.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
//import { initializeApp } from "firebase/app";
import { environment } from 'src/environments/environment';
//import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { Storage } from '@ionic/storage-angular';
import { Device } from '@capacitor/device';
import { PushNotifications } from '@capacitor/push-notifications';
import { LanguageService } from './services/language.service';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';


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

  async ngOnInit() { await this.bootstrap();}

  private async bootstrap() {
  await this.platform.ready();
  await this.dataService.initStorage(); 
  await this.authService.syncLoginStateFromStorage();

  this.dataService.authTokenChanges$.subscribe(token => {
    this.authService.setLoggedIn(!!token);
    if (token) {
      // reload content or refresh any dependent service
      console.log("Auth token updated:", token);
    }
  });

  //await this.initLanguage();
  const lang = await this.initLanguage();
  await this.loadApiTranslations();

  this.translate.use(lang); 
  await this.setReadyPage();
}

  async setReadyPage(){
    console.log('setReadyPage');
    // nakon sto se stranica pokrene ugasiti splash screen
    if(this.platform.is('cordova') || this.platform.is('capacitor')){
      await SplashScreen.hide();
      await StatusBar.show();

      // crna slova na statusbaru
      //await StatusBar.setStyle({ style: Style.Light });

      // pokreni inicijalizaciju notifikacija
      await this.initNotifications();
    }

    // izvrisit sve provjere i funkcije prije ove funkcije
    // jer tek kad se pokrene ova funkcija dozvoljava se 
    // pokretanje prve stranice
    this.contrCtrl.setReadyPage();
  }

  async initStorage() {
    await this.storage.create();
  }

  private async initLanguage() {
  const savedLang = await this.storage.get('selectedLang');
  if (savedLang) {
    this.translate.setDefaultLang(savedLang);
    return savedLang;
  }

  let deviceLang = 'hr';

  try {
    const info = await Device.getLanguageCode();
    deviceLang = info.value?.toLowerCase() ?? 'en';
  } catch {
    const browserLang = this.translate.getBrowserLang();
    if (browserLang) deviceLang = browserLang;
  }

  const finalLang = deviceLang.startsWith('hr') ? 'hr' : 'en';

  this.translate.setDefaultLang(finalLang);
  await this.storage.set('selectedLang', finalLang);

  return finalLang;
}

private async loadApiTranslations() {
  try {
    const langs = await firstValueFrom(
      this.languageService.getLanguages()
    ).catch(() => []); // fallback if API fails

    let translations: Record<string, any> = {};

    if (langs.length) {
      translations = await firstValueFrom(
        this.languageService.getTranslations(langs)
      ).catch(() => ({}))
    }

    // Merge API translations with default translations
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

    // Always set default translations first
    this.translate.setTranslation('hr', defaultHrTranslations, true);

    // Then merge API translations (if any)
    Object.entries(translations).forEach(([lang, values]) => {
      this.translate.setTranslation(lang, values as any, true);
    });

    const currentLang = await this.storage.get('selectedLang') || 'hr';
    this.translate.setDefaultLang(currentLang);
    this.translate.use(currentLang);

    console.log('Translations loaded for:', currentLang);

  } catch (err) {
    console.error('Translation loading error:', err);
  }
}

async initNotifications() {
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

async addListeners() {
  await PushNotifications.addListener('registrationError', err => {
    console.error('Registration error: ', err.error);
  });

  await PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push notification received: ', notification);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    console.log('Push notification action performed', notification.actionId, notification.inputValue);
  });
}

}
