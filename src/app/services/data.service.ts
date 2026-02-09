import { Injectable } from '@angular/core';
import { ControllerService } from './controller.service';
import { ContentObject } from '../model/content';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import * as sha1 from 'sha1';


export enum AlertType {
  Success = 'success',
  Warning = 'warning',
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private authReadyResolve!: (value?: unknown) => void;

  authReady = new Promise(resolve => this.authReadyResolve = resolve);


  url: string = '/api/content/structure?pagination=0';
  content: Array<ContentObject> = [];
  content_signature: string = '';
  loader: any;
  pushToken: string | null = null;
  authToken: string | null = null;
  username: string | null = null;
  email: string | null = null;
  lastLogin: string | null = null;


  constructor(
  private apiCtrl: ControllerService,
  private translateCtrl: TranslateService,
  private toastController: ToastController,
  private storage: Storage
) {
  
}

async initData() {
    await this.loadFirebaseToken();

    this.authToken = await this.storage.get('auth_token');
    this.username = await this.storage.get('username');
    this.email = await this.storage.get('email');
    this.lastLogin = await this.storage.get('lastlogin');

    this.authReadyResolve();
  }

  waitForAuthReady() {
    return this.authReady;
  }

  async loadFirebaseToken() {
  const token = await this.storage.get('firebase_token');
  this.pushToken = token;
  return token;
}

  async savePushToken(token: string) {
  this.pushToken = token;
  await this.storage.set('firebase_token', token);
  console.log('Saved push token:', token);
}

  async initStorage() {
  console.log("Initializing storage...");
  //await this.storage.create();
  await this.loadFirebaseToken();

  this.authToken = await this.storage.get('auth_token');
  this.username = await this.storage.get('username');
  this.email = await this.storage.get('email');
  this.lastLogin = await this.storage.get('lastlogin');

  this.authReadyResolve();
}



/*async setAuthData(username: string, email: string, lastLogin: string) {
  console.log("raw data:", username + "++traffic--call++" + lastLogin);
  const token = sha1(username + "++traffic--call++" + lastLogin);

  this.authToken = token;
  this.username = username;
  this.email = email;
  this.lastLogin = lastLogin;

  await this.storage.set('auth_token', token);
  await this.storage.set('username', username);
  await this.storage.set('email', email);
  await this.storage.set('lastlogin', lastLogin);

  localStorage.setItem('email', email);

  console.log("AUTH TOKEN CREATED:", token);

  if (this.authReadyResolve) {
    this.authReadyResolve();
  }
}*/

async setAuthData(username: string, email: string, lastLogin: string, isRegister: boolean = false) {
  let token: string;

  if (isRegister) {
    // Token generated at registration time
    token = sha1(username + "++traffic--call++" + lastLogin);
    await this.storage.set('register_token', token); 
  } else {
    // Use existing token from storage (login)
    token = await this.storage.get('auth_token') || sha1(username + "++traffic--call++" + lastLogin);
  }

  this.authToken = token;
  this.username = username;
  this.email = email;
  this.lastLogin = lastLogin;

  await this.storage.set('auth_token', token);
  await this.storage.set('username', username);
  await this.storage.set('email', email);
  await this.storage.set('lastlogin', lastLogin);

  localStorage.setItem('email', email);

  if (this.authReadyResolve) this.authReadyResolve();
}



async getAuthToken(): Promise<string | null> {
  if (this.authToken) return this.authToken;

  // If not in memory, read from storage
  this.authToken = await this.storage.get('auth_token');
  console.log("Retrieved auth token from storage:", this.authToken);
  return this.authToken;
}

public async getStorageItem(key: string): Promise<any> {
  return this.storage.get(key);
}

getEmail(): string | null {
  return this.email;
}


async clearAuthData() {
  this.authToken = null;
  this.username = null;
  this.email = null;
  this.lastLogin = null;

  await this.storage.remove('auth_token');
  await this.storage.remove('username');
  await this.storage.remove('email');
  await this.storage.remove('lastlogin');

  localStorage.removeItem('email');
  localStorage.removeItem('authData');
  localStorage.removeItem('auth_token');
}

  translateWord(key: string): Promise<string>{
    let promise = new Promise<string>((resolve, reject) => {
      this.translateCtrl.get(key).toPromise().then( value => {
        resolve(value);
        }
      );
    });
    return promise;
  }
  
}
