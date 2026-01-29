import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

export interface Language {
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private baseUrl = 'https://traffic-call.com/api';
  private authToken: string | null = null;

  constructor(private http: HttpClient, private storage: Storage) {}

  async setAuthToken(token: string) {
    this.authToken = token;
    await this.storage.set('auth_token', token);
  }

  // Helper to get token
  private getToken(): Observable<string> {
    if (this.authToken) return from([this.authToken]);
    return from(this.storage.get('auth_token')).pipe(
      map(token => {
        if (!token) throw new Error('No auth token found');
        this.authToken = token;
        return token;
      })
    );
  }

  // Get list of languages from API
  getLanguages(): Observable<Language[]> {
  return this.getToken().pipe(
    switchMap(token => {
      const body = new URLSearchParams();
      body.set('token', token);

      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      return this.http.post<any[]>(
        `${this.baseUrl}/languages.php`,
        body.toString(),
        { headers }
      );
    }),
    map(response => {
      console.log('RAW languages response:', response);
      return response
        .filter(item => item.title && item.shortcut)
        .map(item => ({
          name: item.title,
          code: item.shortcut
        }));
    })
  );
}


  // Get translations for all languages
  getTranslations(): Observable<Record<string, any>> {
  return this.getToken().pipe(
    switchMap(token =>
      this.getLanguages().pipe(
        switchMap(langs => {
          const requests = langs.map(lang => {
            const body = new URLSearchParams();
            body.set('token', token);
            body.set('language', lang.code);

            const headers = new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded'
            });

            return this.http
              .post<any[]>(
                `${this.baseUrl}/translation.php`,
                body.toString(),
                { headers }
              )
              .pipe(
                map(response => {
                  const translations: any = {};

                  response.forEach(item => {
                    if (item.variable && item.translation) {
                      translations[item.variable] = item.translation;
                    }
                  });
                  console.log(`Parsed translations (${lang.code}):`, translations);

                  return { [lang.code]: translations };
                }),
                catchError(() => of({ [lang.code]: {} }))
              );
          });

          return forkJoin(requests);
        })
      )
    ),
    map(results => Object.assign({}, ...results))
  );
}
}
