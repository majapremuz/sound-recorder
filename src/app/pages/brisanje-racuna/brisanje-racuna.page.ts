import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';  
import { IonicModule } from '@ionic/angular';  
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-brisanje-racuna',
  templateUrl: './brisanje-racuna.page.html',
  styleUrls: ['./brisanje-racuna.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class BrisanjeRacunaPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
