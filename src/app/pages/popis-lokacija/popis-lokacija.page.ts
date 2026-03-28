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
  loading?: boolean;
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
  locationModeAll = false;

  constructor(private router: Router, private locationService: LocationService) {}

  ngOnInit() {
    this.loadCountries();
    this.locationModeAll = localStorage.getItem('locationMode') === 'all';

    window.addEventListener('locationModeChanged', () => {
      this.locationModeAll = localStorage.getItem('locationMode') === 'all';
    });
  }

  async loadCountries() {
    this.locationService.getCountries().subscribe({
      next: countriesData => {
        const countryItems = countriesData.filter(item => item.title);
        this.countries = countryItems.map((item, index) => ({
          id: String(index + 1),
          name: item.title,
          cities: []
        }));

        this.countries.forEach(country => this.loadCitiesForCountry(country));

        // Fetch user selected cities after countries loaded
        this.locationService.getUserSelectedCities().subscribe(selectedCities => {
          this.countries.forEach(country => {
            country.cities.forEach(city => {
              city.enabled = selectedCities.includes(city.name);
            });
          });
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
            enabled: false // will be updated from server after getUserSelectedCities()
          }));
      },
      error: err => console.error(`Cities error for ${country.name}:`, err)
    });
  }

  onCityToggle(city: any, event: any) {
  const checked = event.detail.checked;

  city.enabled = checked;

  if (checked) {
    this.locationService.addUserLocation(city.name).subscribe();
  } else {
    this.locationService.removeUserLocation(city.name).subscribe();
  }
}

  isAllMode(): boolean {
  return localStorage.getItem('locationMode') === 'all';
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
