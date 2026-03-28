import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService, Language } from 'src/app/services/language.service';
import { switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage-angular';

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
    private dataService: DataService,
    private storage: Storage
  ) {}

  async ngOnInit() {
  const key = await this.dataService.getLanguageKey();
  const savedLang = await this.dataService.getStorageItem(key);

  this.selectedLang =
    savedLang ||
    this.translateService.currentLang ||
    'hr';

    this.initLanguagesAndTranslations();
}

  private async initLanguagesAndTranslations() {
  const key = await this.dataService.getLanguageKey();
  let savedLang = await this.dataService.getStorageItem(key);

  // ✅ enforce default for guest
  const email = await this.dataService.getStorageItem('email');
  if (!email) {
    savedLang = 'hr';
  }

  this.languageService.getLanguages().pipe(
    switchMap(langs => {
      this.languages = langs;

      this.translateService.addLangs(langs.map(l => l.code));

      return this.languageService.getTranslations(langs); // ✅ THIS WAS MISSING
    })
  ).subscribe({
    next: translations => {

      Object.entries(translations).forEach(([lang, values]) => {
        this.translateService.setTranslation(lang, values as any, true);
      });

      const langToUse = savedLang || 'hr';

      this.translateService.use(langToUse);
      this.selectedLang = langToUse;

      this.loading = false;
    },
    error: err => {
      console.error('Error loading languages/translations:', err);

      this.translateService.use('hr');
      this.loading = false;
    }
  });
}

  async changeLanguage(lang: string) {
  this.selectedLang = lang;
  this.translateService.use(lang);
  const key = await this.dataService.getLanguageKey();
  await this.dataService.setStorageItem(key, lang);
}


  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
