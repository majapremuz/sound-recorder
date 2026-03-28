import { Injectable } from '@angular/core';
import { ControllerService } from './controller.service';
import { ContentObject } from '../model/content';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import * as sha1 from 'sha1';
import { BehaviorSubject } from 'rxjs';


export enum AlertType {
  Success = 'success',
  Warning = 'warning',
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private storageReadyResolve!: () => void;
  storageReady = new Promise<void>(resolve => this.storageReadyResolve = resolve);

  private authToken$ = new BehaviorSubject<string | null>(null);
  authTokenChanges$ = this.authToken$.asObservable();

  private email$ = new BehaviorSubject<string | null>(null);
  emailChanges$ = this.email$.asObservable();

  authToken: string | null = null;
  email: string | null = null;
  username: string | null = null;
  lastLogin: string | null = null;

  private pushToken$ = new BehaviorSubject<string | null>(null);
  pushTokenChanges$ = this.pushToken$.asObservable();

  url: string = '/api/content/structure?pagination=0';
  content: Array<ContentObject> = [];
  content_signature: string = '';
  loader: any;
  pushToken: string | null = null;

  constructor(
  private apiCtrl: ControllerService,
  private translateCtrl: TranslateService,
  private toastController: ToastController,
  private storage: Storage
) {}
  async loadFirebaseToken() {
  const token = await this.storage.get('firebase_token');
  this.pushToken = token;
  return token;
}

  async savePushToken(token: string) {
  this.pushToken = token;
  await this.storage.set('firebase_token', token);
  this.pushToken$.next(token);
  console.log('Saved push token:', token);
}

  async initStorage() {
  console.log("Initializing storage...");
  await this.storage.create(); // make sure storage is ready

  // load push token first
  const token = await this.loadFirebaseToken();
  if (token) this.pushToken$.next(token);

  // load auth info
  this.authToken = await this.storage.get('auth_token');
  this.username = await this.storage.get('username');
  this.email = await this.storage.get('email');
  this.lastLogin = await this.storage.get('lastlogin');

  this.authToken$.next(this.authToken);
  this.email$.next(this.email);

  // mark storage as ready
    this.storageReadyResolve();
}

async setAuthData(username: string, email: string, lastLogin: string) {
  await this.ensureStorageReady(); 

//format: maja++traffic--call++2026-01-12 18:30:47
  console.log("raw data for token generation:", username + "++traffic--call++" + lastLogin);
  const token = sha1(username + "++traffic--call++" + lastLogin);

  this.authToken = token;
  this.username = username;
  this.email = email;
  this.lastLogin = lastLogin;

  this.authToken$.next(token);
  this.email$.next(email);

  await this.storage.set('auth_token', token);
  await this.storage.set('username', username);
  await this.storage.set('email', email);
  await this.storage.set('lastlogin', lastLogin);
}

async getAuthToken(): Promise<string | null> {
    await this.ensureStorageReady();
    return this.authToken;
  }

async getStorageItem(key: string): Promise<any> {
    await this.ensureStorageReady();
    return this.storage.get(key);
  }

async setStorageItem(key: string, value: any): Promise<void> {
    await this.ensureStorageReady();
    return this.storage.set(key, value);
  }

  async clearAuthData() {
  await this.ensureStorageReady(); 
  await this.storage.remove('auth_token');
  await this.storage.remove('username');
  await this.storage.remove('email');
  await this.storage.remove('lastlogin');

  this.authToken = null;
  this.username = null;
  this.email = null;

  this.authToken$.next(null);
  this.email$.next(null);
}

async getLanguageKey(): Promise<string> {
    await this.ensureStorageReady();
    return this.email ? `selectedLang_${this.email}` : 'selectedLang_guest';
  }

  async ensureStorageReady() {
  if (!this.storageReadyResolve) {
    console.warn("Storage not initialized yet, initializing now...");
    await this.initStorage();
  }
  await this.storageReady;
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
