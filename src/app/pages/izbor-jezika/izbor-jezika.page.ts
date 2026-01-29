import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService, Language } from 'src/app/services/language.service';

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

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
  this.translateService.setDefaultLang('hr');
  this.initLanguagesAndTranslations();
}

private initLanguagesAndTranslations() {
  // Fetch languages
  this.languageService.getLanguages().subscribe(langs => {
    console.log('Languages from API:', langs);
    this.languages = langs;
  });

  // Fetch translations
  this.languageService.getTranslations().subscribe(translations => {
  console.log('Translations from API:', translations);

  Object.keys(translations).forEach(lang => {
    this.translateService.setTranslation(lang, translations[lang], true);
  });

  this.translateService.reloadLang(this.selectedLang);
  this.translateService.use(this.selectedLang);
});
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  changeLanguage(lang: string) {
    this.selectedLang = lang;
    this.translateService.use(lang);
  }
}
