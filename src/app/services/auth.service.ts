import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //private tokenKey = 'userToken';
  private tokenKey = 'authData';
  private apiUrl = `${environment.rest_server.protokol}${environment.rest_server.host}${environment.rest_server.functions.token}`;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
  const url = `https://traffic-call.com/api/login.php`;

  const body = {
    username,
    password
  };

  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  return this.http.post<any>(url, body, { headers }).pipe(
    tap(response => {
      if (response.access_token) {
        const tokenData = {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expiry: Date.now() + response.expires_in * 1000
        };
        localStorage.setItem(this.tokenKey, JSON.stringify(tokenData));

        this.getUser().catch(err => console.error('Failed to fetch user:', err));
      }
    })
  );
}

  getToken(): string | null {
  const tokenData = this.getTokenData();
  return tokenData ? tokenData.access_token : null;
}

  logout(): void {
  localStorage.removeItem(this.tokenKey);
  localStorage.removeItem('currentUser');
}

  isLoggedIn(): boolean {
  const tokenData = this.getTokenData();
  return !!(tokenData && tokenData.access_token);
}

changePassword(oldPassword: string, newPassword: string): Promise<any> {
  const url = `${environment.rest_server.protokol}${environment.rest_server.host}${environment.rest_server.functions.api}user/change-password`;

  const body = {
    old_password: oldPassword,
    new_password: newPassword
  };

  return new Promise((resolve, reject) => {

    //❗ When backend is ready, UNCOMMENT the HTTP request
    /*
    this.http.post<any>(url, body, { headers: this.getAuthHeaders() }).subscribe({
      next: (res) => {
        if (res.status) {
          resolve(res);
        } else {
          reject(res.message || "Lozinka nije promijenjena.");
        }
      },
      error: (err) => {
        reject("Greška prilikom mijenjanja lozinke.");
      }
    });
    */

    // Temporary mock behavior (so your UI works now)
    console.log("Password change requested (MOCK):", body);
    setTimeout(() => resolve({ status: true, message: "Mock password change OK" }), 1000);

  });
}

deleteAccount(): Observable<any> {
  const url = '/user/delete';

  // If backend requires token
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.getToken()}`
  });

  return this.http.delete(url, { headers }).pipe(
    tap(() => {
      // optional: clear stored token
      localStorage.removeItem('userToken');
    })
  );
}


  getTokenData(): any {
  const token = localStorage.getItem(this.tokenKey);
  return token ? JSON.parse(token) : null;
}

  refreshToken(): Promise<void> {
  const url = `${environment.rest_server.protokol}${environment.rest_server.host}${environment.rest_server.functions.token}`;
  console.log('Refreshing token from URL:', url);
  const tokenData = this.getTokenData();

  const body = new URLSearchParams();
  body.set('grant_type', 'refresh_token');
  body.set('client_id', 'testclient');
  body.set('client_secret', 'testpass');
  body.set('refresh_token', tokenData.refresh_token);

  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  return new Promise((resolve, reject) => {
    this.http.post<any>(url, body.toString(), { headers }).subscribe({
      next: (res) => {
        if (res.access_token) {
          const expiry = Date.now() + res.expires_in * 1000;
          localStorage.setItem(this.tokenKey, JSON.stringify({
            access_token: res.access_token,
            token_type: res.token_type,
            expiry,
            refresh_token: res.refresh_token || tokenData.refresh_token
          }));
          resolve();
        } else {
          reject('Refresh token failed.');
        }
      },
      error: (err) => {
        console.error('Refresh error:', err);
        reject(err.error?.error_description || 'Greška kod obnove tokena.');
      }
    });
  });
}


  /** Returns Authorization header for API calls */
  getAuthHeaders(): HttpHeaders {
    const tokenData = this.getTokenData();
    return new HttpHeaders({
      'Authorization': `Bearer ${tokenData.access_token}`
    });
  }


getUser(): Promise<any> {
  const url = `${environment.rest_server.protokol}${environment.rest_server.host}${environment.rest_server.functions.api}user/user`;
  console.log('Fetching user from URL:', url);

  return new Promise((resolve, reject) => {
    this.http.get<any>(url, { headers: this.getAuthHeaders() }).subscribe({
      next: (res) => {
        console.log('User data raw:', res);

        if (!res || !res.data) {
          reject('Neispravan odgovor sa servera.');
          return;
        }

        const user = res.data; 

        const mappedUser = {
          user_id: user.user_id,
          ime: user.user_firstname,
          prezime: user.user_lastname,
          telefon: user.user_phone,
          email: user.user_email,
          city: user.user_city,
          zip: user.user_zip,
          address: user.user_address
        };

        console.log('Mapped user data:', mappedUser);


        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
        resolve(mappedUser);
      },
      error: (err) => {
        console.error('Get user error:', err);
        reject('Ne mogu dohvatiti korisnika.');
      }
    });
  });
}

updateUser(data: { ime: string; prezime: string; telefon: string; city?: string; zip?: string; address?: string }): Promise<any> {
  const url = `${environment.rest_server.protokol}${environment.rest_server.host}${environment.rest_server.functions.api}user/user`;

  const currentUser = this.getCurrentUser();

  const payload = {
    user_id: currentUser?.user_id,
    user_firstname: data.ime,
    user_lastname: data.prezime,
    user_phone: data.telefon,
    user_city: data.city || currentUser?.city || "",
    user_zip: data.zip || currentUser?.zip || "",
    user_address: data.address || currentUser?.address || ""
  };

  return new Promise((resolve, reject) => {
    this.http.put<any>(url, payload, { headers: this.getAuthHeaders() }).subscribe({
      next: (res) => {
        console.log('Update user response:', res);
        if (res.status) {
          // refresh local copy
          this.getUser().then(() => resolve(res));
        } else {
          reject(res.message || 'Greška kod ažuriranja profila.');
        }
      },
      error: (err) => {
        console.error('Update user error:', err);
        reject('Ne mogu ažurirati profil.');
      }
    });
  });
}

deleteUser(userId: number): Promise<any> {
  const url = `${environment.rest_server.protokol}${environment.rest_server.host}${environment.rest_server.functions.api}user/user/${userId}`;

  return new Promise((resolve, reject) => {
    this.http.delete<any>(url, { headers: this.getAuthHeaders() }).subscribe({
      next: (res) => {
        console.log("Delete user response:", res);
        if (res.status) {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          resolve(res);
        } else {
          reject(res.message || "Brisanje korisnika nije uspjelo.");
        }
      },
      error: (err) => {
        console.error("Delete user error:", err);
        reject("Greška prilikom brisanja korisnika.");
      }
    });
  });
}


getCurrentUser(): any {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}
}
