import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '../../environments/environment';

const JWTS_LOCAL_KEY = 'JWTS_LOCAL_KEY';
const JWTS_ACTIVE_INDEX_KEY = 'JWTS_ACTIVE_INDEX_KEY';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = environment.auth0.url;
  audience = environment.auth0.audience;
  clientId = environment.auth0.clientId;
  callbackURL = environment.auth0.callbackURL;

  token: string;
  payload: any;

  constructor() { }

  build_login_link(callbackPath = '/tabs/drink-menu') {
    const base = `https://${this.url}.auth0.com/authorize?`;
    const params = [
      `audience=${encodeURIComponent(this.audience)}`,
      `response_type=token`,
      `client_id=${encodeURIComponent(this.clientId)}`,
      `redirect_uri=${encodeURIComponent(this.callbackURL + callbackPath)}`
    ];
    return base + params.join('&');
  }

  // invoked in app.component on load
  check_token_fragment() {
    // parse the fragment
    const fragment = window.location.hash.substr(1).split('&')[0].split('=');
    // check if the fragment includes the access token
    if ( fragment[0] === 'access_token' ) {
      // add the access token to the jwt
      this.token = fragment[1];
      // save jwts to localstore
      this.set_jwt();
    }
  }

  set_jwt() {
    localStorage.setItem(JWTS_LOCAL_KEY, this.token);
    if (this.token) {
      this.decodeJWT(this.token);
    }
  }

  load_jwts() {
    this.token = localStorage.getItem(JWTS_LOCAL_KEY) || null;
    if (this.token) {
      this.decodeJWT(this.token);
    }
  }

  activeJWT() {
    return this.token;
  }

  decodeJWT(token: string) {
    const jwtservice = new JwtHelperService();
    this.payload = jwtservice.decodeToken(token);
    return this.payload;
  }

  logout() {
    this.token = '';
    this.payload = null;
    this.set_jwt();
    // Redirect to Auth0 logout endpoint to clear Auth0 session
    const returnTo = encodeURIComponent(this.callbackURL + '/tabs/drink-menu');
    const logoutUrl = `https://${this.url}.auth0.com/v2/logout?client_id=${encodeURIComponent(this.clientId)}&returnTo=${returnTo}`;
    window.location.href = logoutUrl;
  }

  can(permission: string) {
    return this.payload && this.payload.permissions && this.payload.permissions.length && this.payload.permissions.indexOf(permission) >= 0;
  }
}
