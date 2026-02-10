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
        const countryItems = data.filter(item => item.title);

        this.countries = countryItems.map((item, index) => ({
          id: String(index + 1),
          name: item.title,
          cities: []
        }));

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
            enabled: this.isAllMode() || this.isCitySelected(item.title)
          }));
      },
      error: err =>
        console.error(`Cities error for ${country.name}:`, err)
    });
  }

  onCityToggle(city: City) {
    city.loading = true;

    const request$ = city.enabled
      ? this.locationService.addUserLocation(city.name)
      : this.locationService.removeUserLocation(city.name);

    request$.subscribe({
      next: () => {
        city.loading = false;

        if (city.enabled) {
          this.saveSelectedCity(city.name);
        } else {
          this.removeSelectedCity(city.name);
        }

        if (this.isAllMode()) {
        localStorage.setItem('locationMode', 'selected');
      }
      },
      error: () => {
        city.enabled = !city.enabled;
        city.loading = false;
      }
    });
  }

  isAllMode(): boolean {
  return localStorage.getItem('locationMode') === 'all';
}


  /* -----------------------
     Local storage helpers
     ----------------------- */

  private saveSelectedCity(cityName: string) {
    const saved = JSON.parse(localStorage.getItem('selectedCities') || '[]');

    if (!saved.includes(cityName)) {
      saved.push(cityName);
      localStorage.setItem('selectedCities', JSON.stringify(saved));
    }
  }

  private removeSelectedCity(cityName: string) {
    const saved = JSON.parse(localStorage.getItem('selectedCities') || '[]');
    const updated = saved.filter((c: string) => c !== cityName);

    localStorage.setItem('selectedCities', JSON.stringify(updated));

    if (updated.length === 0) {
      localStorage.setItem('locationMode', 'all');
    }
  }

  private isCitySelected(cityName: string): boolean {
    const saved = JSON.parse(localStorage.getItem('selectedCities') || '[]');
    return saved.includes(cityName);
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
