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
  private getUserLocationsUrl = 'https://traffic-call.com/api/getUserLocations.php';

  private selectedCitiesSubject = new BehaviorSubject<string[]>([]);
  selectedCities$ = this.selectedCitiesSubject.asObservable();

  constructor(private http: HttpClient, private dataService: DataService) {}

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

  /** Fetch user’s selected cities from server */
  getUserSelectedCities(): Observable<string[]> {
    return from(this.dataService.getAuthToken()).pipe(
      switchMap(token => this.http.post<string[]>(this.getUserLocationsUrl, { token })),
      tap(cities => this.selectedCitiesSubject.next(cities))
    );
  }

  addUserLocation(cityName: string): Observable<any> {
    return from(this.dataService.getAuthToken()).pipe(
      switchMap(token => this.http.post(this.addUserLocationUrl, { token, location: cityName })),
      tap(() => {
        const current = this.selectedCitiesSubject.value;
        if (!current.includes(cityName)) {
          this.selectedCitiesSubject.next([...current, cityName]);
        }
      })
    );
  }

  removeUserLocation(cityName: string): Observable<any> {
    return from(this.dataService.getAuthToken()).pipe(
      switchMap(token => this.http.post(this.removeUserLocationUrl, { token, location: cityName })),
      tap(() => {
        const updated = this.selectedCitiesSubject.value.filter(c => c !== cityName);
        this.selectedCitiesSubject.next(updated);
      })
    );
  }

resetSelectedCities() {
  this.selectedCitiesSubject.next([]);
}
}
