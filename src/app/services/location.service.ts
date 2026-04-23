import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { Observable, from, BehaviorSubject, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocationService {

  private countriesUrl = 'https://traffic-call.com/api/countries.php';
  private citiesUrl = 'https://traffic-call.com/api/cities.php';
  private addUserLocationUrl = 'https://traffic-call.com/api/addUserLocation.php';
  private removeUserLocationUrl = 'https://traffic-call.com/api/removeUserLocation.php';

  selectedCitiesSubject = new BehaviorSubject<string[]>([]);
  selectedCities$ = this.selectedCitiesSubject.asObservable();

  constructor(private http: HttpClient, private dataService: DataService) {
    const saved = localStorage.getItem('selectedCities');
  if (saved) {
    this.selectedCitiesSubject.next(JSON.parse(saved));
  }
  }

  getCountries(): Observable<any[]> {
    return from(this.dataService.getAuthToken()).pipe(
      switchMap(token => this.http.post<any[]>(this.countriesUrl, { token }))
    );
  }

  getCities(countryId: string): Observable<any[]> {
    return from(this.dataService.getAuthToken()).pipe(
      switchMap(token => this.http.post<any[]>(this.citiesUrl, { token, country: countryId }))
    );
  }

  addUserLocation(cityName: string): Observable<any> {
  return from(this.dataService.getAuthToken()).pipe(
    switchMap(token =>
      this.http.post(this.addUserLocationUrl, { token, location: cityName })
    ),
    tap(() => {
      const current = this.selectedCitiesSubject.value;
      if (!current.includes(cityName)) {
        const updated = [...current, cityName];
        this.selectedCitiesSubject.next(updated);
        localStorage.setItem('selectedCities', JSON.stringify(updated));
      }
    })
  );
}

  removeUserLocation(cityName: string): Observable<any> {
  return from(this.dataService.getAuthToken()).pipe(
    switchMap(token =>
      this.http.post(this.removeUserLocationUrl, { token, location: cityName })
    ),
    tap(() => {
      const updated = this.selectedCitiesSubject.value.filter(c => c !== cityName);
      this.selectedCitiesSubject.next(updated);
      localStorage.setItem('selectedCities', JSON.stringify(updated));
    })
  );
  }

resetSelectedCities() {
  console.log('RESETTING CITIES');
  this.selectedCitiesSubject.next([]);
  localStorage.removeItem('selectedCities');
}
}
