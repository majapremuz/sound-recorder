import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocationService } from 'src/app/services/location.service';

interface Country {
  id: string;
  name: string;
  cities: City[];
}

interface City {
  id: number;
  name: string;
  enabled: boolean;
}

@Component({
  selector: 'app-popis-lokacija',
  templateUrl: './popis-lokacija.page.html',
  styleUrls: ['./popis-lokacija.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, TranslateModule]
})
export class PopisLokacijaPage implements OnInit {

  countries: Country[] = [];

  constructor(
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
this.locationService.getCountries().subscribe({
next: data => {


// Remove the "Success" object
const countryItems = data.filter(item => item.title);


this.countries = countryItems.map((item, index) => ({
  id: String(index + 1), 
  name: item.title,
  cities: []
}));


// Load cities per country
this.countries.forEach(country => {
this.loadCitiesForCountry(country);
});
},
error: err => console.error('Countries error:', err)
});
}

loadCitiesForCountry(country: Country) {
  this.locationService.getCities(country.id).subscribe({
    next: data => {
      country.cities = data
        .filter(item => item.title)
        .map((item, index) => ({
          id: index + 1,
          name: item.title,
          enabled: false
        }));
    },
    error: err =>
      console.error(`Cities error for ${country.name}:`, err)
  });
}
  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
