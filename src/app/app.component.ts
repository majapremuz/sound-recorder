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
import { initializeApp } from "firebase/app";
import { environment } from 'src/environments/environment';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { Storage } from '@ionic/storage-angular';
import { Device } from '@capacitor/device';


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
    private storage: Storage
  ) {}

  async ngOnInit() { await this.bootstrap();}

  private async bootstrap() {
  await this.platform.ready();
  await this.storage.create();

  await this.initLanguage();

  await this.dataService.initStorage();
  await this.dataService.waitForAuthReady();

  this.dataService.authTokenChanges$.subscribe(token => {
    this.authService.setLoggedIn(!!token);
  });

  await this.authService.restoreLoginState();

  await this.initFirebase();

  this.contrCtrl.setReadyPage();

  await SplashScreen.hide();
  await StatusBar.show();

  console.log('App fully bootstrapped');
}

  async setReadyPage(){
    // nakon sto se stranica pokrene ugasiti splash screen
    if(this.platform.is('cordova') || this.platform.is('capacitor')){
      await SplashScreen.hide();
      await StatusBar.show();

      // crna slova na statusbaru
      //await StatusBar.setStyle({ style: Style.Light });

      // pokreni inicijalizaciju notifikacija
      // await this.initNotifications();
    }

    // izvrisit sve provjere i funkcije prije ove funkcije
    // jer tek kad se pokrene ova funkcija dozvoljava se 
    // pokretanje prve stranice
    this.contrCtrl.setReadyPage();
  }

  async initStorage() {
    await this.storage.create();
    console.log('✅ Storage initialized');
  }

  private async initLanguage() {
  // 1️⃣ previously selected language
  const savedLang = localStorage.getItem('appLanguage');
  if (savedLang) {
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
    return;
  }

  // 2️⃣ device language
  let deviceLang = 'hr';

  try {
    const info = await Device.getLanguageCode();
    deviceLang = info.value?.toLowerCase() ?? 'en';
  } catch {
    const browserLang = this.translate.getBrowserLang();
    if (browserLang) deviceLang = browserLang;
  }

  // 3️⃣ normalize
  const finalLang = deviceLang.startsWith('hr') ? 'hr' : 'en';

  this.translate.setDefaultLang(finalLang);
  this.translate.use(finalLang);

  localStorage.setItem('appLanguage', finalLang);

  console.log('🌍 App language initialized:', finalLang);
}

private async initFirebase() {
  try {
    initializeApp(environment.firebase);
  } catch {}

  try {
    const perm = await FirebaseMessaging.requestPermissions();
    console.log('Push permission:', perm);
  } catch {}

  try {
    const token = await FirebaseMessaging.getToken();
    if (token?.token) {
      await this.dataService.savePushToken(token.token);
    }
  } catch {}
}

}
