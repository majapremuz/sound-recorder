import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; 
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-promjena-lozinke',
  templateUrl: './promjena-lozinke.page.html',
  styleUrls: ['./promjena-lozinke.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule]
})
export class PromjenaLozinkePage implements OnInit {
  oldPasswordValue: string = '';
  newPasswordValue: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  changePassword() {
  if (!this.oldPasswordValue || !this.newPasswordValue) {
    alert("Molimo unesite obje lozinke.");
    return;
  }

  if (this.oldPasswordValue === this.newPasswordValue) {
    alert("Nova lozinka mora biti različita od stare.");
    return;
  }

  this.authService.changePassword(
    this.oldPasswordValue,
    this.newPasswordValue
  ).then(res => {
    alert("Lozinka uspješno promijenjena!");
    this.router.navigate(['/profil']);
  }).catch(err => {
    alert(err || "Greška prilikom promjene lozinke.");
  });
}


  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
