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

  private isAuthenticated = true;
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
  }

  login(email: string, password: string) {
    const user: User = {
      _id: null,
      email: email,
      password: password,
    };

    console.log('User Login:', user);

    this.http
      .post<{ token: string; expiresIn: number }>(this.url + 'login', user)
      .subscribe(
        (response) => {
          console.log('Backend Response:', response);

          const token = response.token;
          const expiresInDuration = response.expiresIn;

          if (!expiresInDuration) {
            console.error('Invalid expiration duration:', expiresInDuration);
            return; // If expiresIn is undefined or invalid, stop further processing
          }

          this.token = token;
          if (token) {
            // Check if expiresInDuration is valid
            if (isNaN(expiresInDuration) || expiresInDuration <= 0) {
              console.error('Invalid expiration duration:', expiresInDuration);
              return; // Stop if expiresIn is not valid
            }

            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.authStatusListener.next(true);

            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);

            // Check if expirationDate is valid
            if (isNaN(expirationDate.getTime())) {
              console.error('Invalid expiration date:', expirationDate);
              return; // Stop if expirationDate is not valid
            }

            console.log('Token expires at:', expirationDate);
            this.saveAuthData(token, expirationDate);
            this.router.navigate(['/admin/']);
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
    if (isNaN(expirationDate.getTime())) {
      console.error('Invalid expiration date:', expirationDate);
      return; // Tidak menyimpan jika expirationDate tidak valid
    }
    console.log('Saving Auth Data:', { token, expirationDate });
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    let token = null;
    let expirationDate = null;

    if (this.isBrowser) {
      token = localStorage.getItem('token');
      expirationDate = localStorage.getItem('expiration');
    }

    if (!token || !expirationDate) {
      return;
    }

    const parsedExpirationDate = new Date(expirationDate);
    
    // Memastikan expirationDate valid
    if (isNaN(parsedExpirationDate.getTime())) {
      console.error('Invalid expiration date:', parsedExpirationDate);
      return;
    }

    return {
      token: token,
      expirationDate: parsedExpirationDate,
    };
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
  
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
      this.router.navigate(['/admin/']);
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
