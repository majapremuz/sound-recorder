import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from './environments/environment';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { addIcons } from 'ionicons';
import { play, pause } from 'ionicons/icons';


addIcons({ play, pause });

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    './assets/i18n/',
    '.json?v=' + Date.now()
  );
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AndroidPermissions,
    importProvidersFrom(
      IonicModule.forRoot(),
      IonicStorageModule.forRoot(),
      AppRoutingModule,
      HttpClientModule,
      IonicStorageModule.forRoot(),
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireStorageModule,
      AngularFirestoreModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
}).catch(err => console.error(err));
