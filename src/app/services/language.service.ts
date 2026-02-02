import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { DataService } from './data.service';

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

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private dataService: DataService
  ) {}

  async setAuthToken(token: string) {
    this.authToken = token;
    await this.storage.set('auth_token', token);
  }

  private getToken(): Observable<string> {
    if (this.authToken) return from([this.authToken]);

    return from(this.storage.get('auth_token')).pipe(
      switchMap(token => {
        if (!token) {
          return from(this.dataService.waitForAuthReady()).pipe(
            switchMap(() => {
              const t = this.dataService.getAuthToken();
              if (!t) throw new Error('No auth token found after init');
              return of(t);
            })
          );
        }
        this.authToken = token;
        return of(token);
      })
    );
  }

  /** Get all available languages */
  getLanguages(): Observable<Language[]> {
    return this.getToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.post<any[]>(`${this.baseUrl}/languages.php`, { token }, { headers });
      }),
      map(response => {
        // Filter only items with title and shortcut
        return response
          .filter(item => item.title && item.shortcut)
          .map(item => ({
            name: item.title!,
            code: item.shortcut!.toLowerCase()
          }));
      })
    );
  }

  /** Get translations for a list of languages */
  getTranslations(langs: Language[]): Observable<Record<string, Record<string, string>>> {
  return this.getToken().pipe(
    switchMap(token => {
      const requests = langs.map(lang => {
        const body = {
          token: token,
          language: lang.code
        };

        return this.http.post<any[]>(
          `${this.baseUrl}/translations.php`,
          body,
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json'
            })
          }
        ).pipe(
          map(response => {
            console.log(`RAW translation response (${lang.code}):`, response);

            const translations: Record<string, string> = {};
            response.forEach(item => {
              if (item.variable && item.translation != null) {
                translations[item.variable] = item.translation;
              }
            });
            console.log(`Translation request for ${lang.code}:`, body, `${this.baseUrl}/translations.php`)
            return { [lang.code]: translations };
          }),
          catchError(err => {
            console.error(`Translation error for ${lang.code}:`, err);
            return of({ [lang.code]: {} });
          })
        );
      });

      return forkJoin(requests);
    }),
    map(results => Object.assign({}, ...results))
  );
}

}
