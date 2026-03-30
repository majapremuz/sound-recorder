import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable, tap, BehaviorSubject, from, switchMap } from 'rxjs';
import * as sha1 from 'sha1';
import { Storage } from '@ionic/storage-angular';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.rest_server.protokol}${environment.rest_server.host}${environment.rest_server.functions.token}`;
  /*private loggedIn$ = new BehaviorSubject<boolean>(
  !!localStorage.getItem('auth_token')
);*/
private loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient, 
    private router: Router,
    private storage: Storage,
    private dataService: DataService
  ) {}

async fullLogout() {
  await this.dataService.ensureStorageReady();

  const email = this.dataService.email || await this.dataService.getStorageItem('email');
  console.log('Logging out user:', email);

  if (email) {
    const userLangKey = `selectedLang_${email}`;
    const lang = await this.dataService.getStorageItem(userLangKey);

    if (lang) {
      await this.dataService.setStorageItem('selectedLang_guest', lang);
      console.log('Saved guest language:', lang);
    }
  }
  await this.dataService.clearAuthData();
  this.loggedIn$.next(false);

  console.log('Full logout complete.');
}

  setLoggedIn(value: boolean) {
  this.loggedIn$.next(value);
  console.log('Login state changed:', value);
}

isLoggedIn$(): Observable<boolean> {
  return this.loggedIn$.asObservable();
}

async syncLoginStateFromStorage() {
  const username = await this.dataService.getStorageItem('username');
  this.loggedIn$.next(!!username);
}


async changePassword(newPassword: string): Promise<any> {
  const token = await this.dataService.getAuthToken();

  if (!token) {
    return Promise.reject('Nema tokena');
  }

  const url = 'https://traffic-call.com/api/changePassword.php';

  const body = {
    token,
    password: sha1(newPassword)
  };

  console.log('Changing password with:', body);

  return new Promise((resolve, reject) => {
    this.http.post<any>(url, body).subscribe({
      next: (res) => {
        if (res.response === 'Success') {
          resolve(res);
          console.log("Password changed:", res);
        } else {
          reject(res.message || 'Lozinka nije promijenjena');
        }
      },
      error: () => reject('Greška na serveru')
    });
  });
}


deleteAccount(): Observable<any> {
  return from(this.dataService.getAuthToken()).pipe(
    switchMap(token => {
      if (!token) throw new Error('No auth token');
      return this.http.post(
        'https://traffic-call.com/api/deleteAccount.php',
        { token }
      );
    }),
    tap(async () => {
      const key = await this.dataService.getLanguageKey();
      const email = await this.dataService.getStorageItem('email');
      if (email) {
        const key = `selectedLang_${email}`;
        await this.storage.remove(key);
      }

      await this.dataService.clearAuthData();
      this.loggedIn$.next(false);
    })
  );
}

}
