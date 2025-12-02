import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private translate: TranslateService) {}

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('appLanguage', lang);
  }

  loadSavedLanguage() {
    const lang = localStorage.getItem('appLanguage') || 'en' || 'hr';
    this.translate.use(lang);
  }
}
