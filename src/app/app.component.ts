import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { TranslateConfigService } from './services/translate-config.service';
import { ControllerService } from './services/controller.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { initializeApp } from "firebase/app";
import { environment } from 'src/environments/environment';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { DataService } from './services/data.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


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
    public dataCtrl: DataService,
    private translate: TranslateService, 
  ) {
    const saved = localStorage.getItem('appLanguage') || 'hr';
    this.translate.setDefaultLang(saved);
    this.translate.use(saved);
    this.initApp();
  }

  ngOnInit() {}
    async initApp() {
  await this.platform.ready();

  // Firebase safely
  try {
    initializeApp(environment.firebase);
  } catch {}

  try {
    const perm = await FirebaseMessaging.requestPermissions();
    console.log("Push permission:", perm);
  } catch {}

  try {
    const token = await FirebaseMessaging.getToken();
    if (token?.token) await this.dataCtrl.savePushToken(token.token);
  } catch {}

  // Initialize your data
  await this.dataCtrl.initData();   
  await this.dataCtrl.waitForAuthReady(); 
  // Then mark page ready
  this.contrCtrl.setReadyPage();

  // Splash screen and status bar
  await SplashScreen.hide();
  await StatusBar.show();
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

}
