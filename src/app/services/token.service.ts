import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private _authToken: string | null = null;

  get authToken(): string | null {
    return this._authToken;
  }

  set authToken(value: string | null) {
    this._authToken = value;
  }
}
