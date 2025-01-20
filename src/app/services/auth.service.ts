import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = environment.api + 'users/';
  private authStatusListener = new Subject<boolean>();

  private isAuthenticated = false;
  private token: string | null = '';
  private tokenTimer: any;

  private isBrowser!: boolean;

  loginListener() {
    return this.authStatusListener.asObservable();
  }

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    public http: HttpClient,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  
    if (this.isBrowser) {
      console.log('Constructor: Running in a browser environment.');
    } else {
      console.log('Constructor: Running in a server environment (SSR).');
    }
  }
  

  login(email: string, password: string) {
  const user: User = { _id: null, email: email, password: password };
  console.log('User Login:', user);

  if (!this.isBrowser) {
    console.warn('login: Not running in a browser environment.');
    return; // Hentikan jika bukan di browser
  }

  this.http.post<{ token: string; expiresIn: number }>(this.url + 'login', user).subscribe(
    (response) => {
      const token = response.token;
      const expiresInDuration = response.expiresIn;

      if (token && expiresInDuration > 0) {
        this.token = token;
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);

        this.saveAuthData(token, expirationDate);
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.authStatusListener.next(true);

        this.router.navigate(['/admin']).then(() => {
          // window.location.reload();
        });
      }
    },
    (error) => {
      console.error('Login Error:', error);
      this.authStatusListener.next(false);
    }
  );
}
  


  getToken() {
    return this.token;
  }

  getIsAuth() {
    console.log('AuthService - isAuthenticated:', this.isAuthenticated);
    return this.isAuthenticated;
  }

  private saveAuthData(token: string, expirationDate: Date) {
    if (!this.isBrowser) {
      console.warn('saveAuthData: Not running in a browser environment.');
      return; // Jangan simpan jika bukan di browser
    }
  
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }
  

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    if (!this.isBrowser) {
      console.warn('getAuthData: Not running in a browser environment.');
      return null;
    }
  
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
  
    if (!token || !expirationDate) {
      console.error('Auth data missing:', { token, expirationDate });
      return null;
    }
  
    const parsedExpirationDate = new Date(expirationDate);
    return {
      token,
      expirationDate: parsedExpirationDate,
    };
  } 
  

  autoAuthUser() {
    console.log('autoAuthUser: Called.');
    if (!this.isBrowser) {
      console.warn('autoAuthUser: Not running in a browser environment.');
      return;
    }
  
    const authInformation = this.getAuthData();
    console.log('autoAuthUser: Auth Information:', authInformation);
  
    if (!authInformation) {
      return;
    }
  
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
  
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  } 


  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
