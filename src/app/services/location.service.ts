import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocationService {

  private countriesUrl = 'https://traffic-call.com/api/countries.php';
  private citiesUrl = 'https://traffic-call.com/api/cities.php';

  constructor(
    private http: HttpClient,
    private dataService: DataService
  ) {}

  getCountries(): Observable<any[]> {
    const token = this.dataService.getAuthToken();
    return this.http.post<any[]>(this.countriesUrl, {
      token
    });
  }

  getCities(countryId: string): Observable<any[]> {
  const token = this.dataService.getAuthToken();

  return this.http.post<any[]>(this.citiesUrl, {
    token,
    country: countryId 
  });
}
}
