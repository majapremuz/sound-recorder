import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-izbor-jezika',
  templateUrl: './izbor-jezika.page.html',
  styleUrls: ['./izbor-jezika.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class IzborJezikaPage implements OnInit {
  selectedLang = 'hr';

  languages = [
  { code: 'hr', name: 'Hrvatski', flag: 'assets/croatia.png' },
  { code: 'en', name: 'English', flag: 'assets/usa.png' },
  { code: 'de', name: 'Deutsch', flag: 'assets/germany.png' }
];

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit() {
  }

 navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  changeLanguage(lang: string) {
  this.languageService.setLanguage(lang);
  this.selectedLang = lang;
}

}
