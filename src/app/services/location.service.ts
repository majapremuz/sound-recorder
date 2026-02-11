import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { Observable, from, switchMap, BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocationService {

  private countriesUrl = 'https://traffic-call.com/api/countries.php';
  private citiesUrl = 'https://traffic-call.com/api/cities.php';
  private addUserLocationUrl = 'https://traffic-call.com/api/addUserLocation.php';
  private removeUserLocationUrl = 'https://traffic-call.com/api/removeUserLocation.php';

  private selectedCitiesSubject = new BehaviorSubject<string[]>([]);
  selectedCities$ = this.selectedCitiesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private dataService: DataService
  ) {}

  getCountries(): Observable<any[]> {
    return from(this.dataService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) throw new Error('Auth token missing');
        console.log('Fetching countries with token:', token);
        return this.http.post<any[]>(this.countriesUrl, { token });
      })
    );
  }

  getCities(countryId: string): Observable<any[]> {
    return from(this.dataService.getAuthToken()).pipe(
      switchMap(token => {
        if (!token) throw new Error('Auth token missing');
        console.log('Fetching cities with token:', token);
        return this.http.post<any[]>(this.citiesUrl, {
          token,
          country: countryId
        });
      })
    );
  }

  updateSelectedCities(cities: string[]) {
  this.selectedCitiesSubject.next(cities);
  localStorage.setItem('selectedCities', JSON.stringify(cities));
}

  addUserLocation(location: string) {
  return from(this.dataService.getAuthToken()).pipe(
    switchMap(token => this.http.post(this.addUserLocationUrl, { token, location })),
    tap(() => {
      const current = this.selectedCitiesSubject.value;
      if (!current.includes(location)) {
        this.updateSelectedCities([...current, location]);
      }
    })
  );
}

removeUserLocation(location: string) {
  return from(this.dataService.getAuthToken()).pipe(
    switchMap(token => this.http.post(this.removeUserLocationUrl, { token, location })),
    tap(() => {
      const current = this.selectedCitiesSubject.value.filter(c => c !== location);
      this.updateSelectedCities(current);
    })
  );
}


}
