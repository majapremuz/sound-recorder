import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService, Language } from 'src/app/services/language.service';
import { switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-izbor-jezika',
  templateUrl: './izbor-jezika.page.html',
  styleUrls: ['./izbor-jezika.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class IzborJezikaPage implements OnInit {
  selectedLang = 'hr';
  languages: Language[] = [];
  loading = true;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private dataService: DataService
  ) {}

  ngOnInit() {
  const savedLang = localStorage.getItem('selectedLang');

  this.selectedLang =
    savedLang ||
    this.translateService.currentLang ||
    'hr';

  this.dataService.authReady.then(() => {
    this.initLanguagesAndTranslations();
  });
}



  private initLanguagesAndTranslations() {
    this.languageService.getLanguages().pipe(
      tap(langs => {
        this.languages = langs;

        langs.forEach(lang => {
          console.log('Raw flag path:', lang.flag);
          console.log('Full flag URL:', 'https://traffic-call.com' + lang.flag);
        });

        const savedLang = localStorage.getItem('selectedLang');

        this.selectedLang =
          langs.find(l => l.code === savedLang)?.code
          ?? savedLang
          ?? langs[0]?.code
          ?? 'hr';

        this.translateService.addLangs(langs.map(l => l.code));
      }),
      switchMap(langs => {
        if (!langs.length) return of({});
        return this.languageService.getTranslations(langs);
      })
    ).subscribe({
      next: translations => {
        console.log('Translations loaded from API:', translations);

        // Register translations in ngx-translate
        Object.entries(translations).forEach(([lang, values]) => {
          if (values && Object.keys(values).length > 0) {
            this.translateService.setTranslation(lang, values as Record<string, string>, true);
          } else {
            console.warn(`No translations available for ${lang}`);
          }
        });
        this.translateService.use(this.selectedLang);

        this.loading = false;
      },
      error: err => {
        console.error('Error loading languages/translations:', err);
        this.loading = false;
      }
    });
  }

  changeLanguage(lang: string) {
  this.selectedLang = lang;
  this.translateService.use(lang);
  localStorage.setItem('selectedLang', lang);
}


  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
