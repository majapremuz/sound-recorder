import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from './data.service'; // where you generate the token
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private languagesUrl = 'https://traffic-call.com/api/languages.php';
  private translationsUrl = 'https://traffic-call.com/api/translations.php';

  constructor(private http: HttpClient, private dataService: DataService) {}

  private getAuthHeaders(): HttpHeaders {
    // wait for token to be ready
    const token = this.dataService.authToken || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getLanguages(): Observable<Language[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Language[]>(this.languagesUrl, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching languages:', err);
        return of([]); // fallback to empty array
      })
    );
  }

  getTranslations(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(this.translationsUrl, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching translations:', err);
        return of({});
      })
    );
  }
}
