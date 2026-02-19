import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
//import { TranslateService } from '@ngx-translate/core';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from './environments/environment';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { addIcons } from 'ionicons';
import { play, pause } from 'ionicons/icons';


addIcons({ play, pause });


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AndroidPermissions,
    importProvidersFrom(
      IonicModule.forRoot(),
      IonicStorageModule.forRoot(),
      AppRoutingModule,
      HttpClientModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireStorageModule,
      AngularFirestoreModule,
      TranslateModule.forRoot()
    )
  ]
})
.then(appRef => {
  const translate = appRef.injector.get(TranslateService);

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

translate.setTranslation('hr', defaultHrTranslations, true);


  const savedLang = localStorage.getItem('selectedLang');
  const defaultLang = savedLang || 'hr';

  translate.setDefaultLang('hr');
  translate.use(defaultLang);

  console.log('App started with language:', defaultLang);
})
.catch(err => console.error(err));
