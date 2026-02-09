import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
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

  constructor(
    private http: HttpClient,
    private dataService: DataService
  ) {}

  private getToken$(): Observable<string> {
  return from(this.dataService.getAuthToken()).pipe(
    switchMap(token => {
      if (!token) throw new Error('Auth token missing');
      return [token]; // convert to observable
    })
  );
}

  getLanguages(): Observable<Language[]> {
  return this.getToken$().pipe(
    switchMap(token =>
      this.http.post<any[]>(`${this.baseUrl}/languages.php`, { token })
    ),
    map(response =>
      response
        .filter(item => item.title && item.shortcut)
        .map(item => ({
          name: item.title,
          code: item.shortcut.toLowerCase()
        }))
    )
  );
}

getTranslations(langs: Language[]) {
  return this.getToken$().pipe(
    switchMap(token => {
      const requests = langs.map(lang =>
        this.http.post<any[]>(
          `${this.baseUrl}/translations.php`,
          { token, language: lang.code }
        ).pipe(
          map(response => {
            const translations: Record<string, string> = {};
            response.forEach(item => {
              if (item.variable && item.translation != null) {
                translations[item.variable] = item.translation;
              }
            });
            return { [lang.code]: translations };
          })
        )
      );
      return forkJoin(requests);
    }),
    map(results => Object.assign({}, ...results))
  );
}

}
