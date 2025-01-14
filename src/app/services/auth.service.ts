import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core'; // Pastikan ini diimpor dengan benar
import { isPlatformBrowser } from '@angular/common'; // Pastikan ini diimpor dengan benar
import { environment } from '../environments/environment';
import { UserService } from './user.service';

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
  private platformId: Object; // PlatformId bisa diganti dengan Object jika dibutuhkan

  loginListener() {
    return this.authStatusListener.asObservable();
  }

  constructor(
    @Inject(PLATFORM_ID) platformId: Object, // Menggunakan Object atau PlatformId sesuai kebutuhan
    public http: HttpClient,
    private router: Router,
    public userService: UserService,
  ) {
    this.platformId = platformId; // Menginisialisasi platformId
    this.isBrowser = isPlatformBrowser(platformId); // Pastikan isPlatformBrowser digunakan dengan benar
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
            return;
          }
  
          this.token = token;
          if (token) {
            if (isNaN(expiresInDuration) || expiresInDuration <= 0) {
              console.error('Invalid expiration duration:', expiresInDuration);
              return;
            }
  
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.authStatusListener.next(true);
  
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
  
            if (isNaN(expirationDate.getTime())) {
              console.error('Invalid expiration date:', expirationDate);
              return;
            }
  
            console.log('Token expires at:', expirationDate);
            this.saveAuthData(token, expirationDate);
  
            this.userService.fetchUserData(token).subscribe(
              (userResponse) => {
                console.log('User data fetched successfully after login:', userResponse);
              },
              (error) => {
                console.error('Error fetching user data after login:', error);
              }
            );
  
            this.router.navigate(['/admin/']).then(() => {
              window.location.reload();
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
    if (isNaN(expirationDate.getTime())) {
      console.error('Invalid expiration date:', expirationDate);
      return;
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
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Skipping getAuthData on server-side');
      return null;
    }

    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');

    if (!token || !expirationDate) {
      return null;
    }

    const parsedExpirationDate = new Date(expirationDate);

    if (isNaN(parsedExpirationDate.getTime())) {
      console.error('Invalid expiration date:', parsedExpirationDate);
      return null;
    }

    return {
      token: token,
      expirationDate: parsedExpirationDate,
    };
  }

  autoAuthUser() {
    if (!this.isBrowser) {
      console.warn('autoAuthUser skipped because this is not a browser.');
      return;
    }

    const authInformation = this.getAuthData();
    if (!authInformation) {
      this.isAuthenticated = false;
      this.authStatusListener.next(false);
      return;
    }

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    } else {
      this.logout(); // Logout jika token sudah kedaluwarsa
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
