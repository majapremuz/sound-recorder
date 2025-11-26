import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-izbor-jezika',
  templateUrl: './izbor-jezika.page.html',
  styleUrls: ['./izbor-jezika.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class IzborJezikaPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

 navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
