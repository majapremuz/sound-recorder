import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';  
import { IonicModule } from '@ionic/angular';  
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-odjava',
  templateUrl: './odjava.page.html',
  styleUrls: ['./odjava.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class OdjavaPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
