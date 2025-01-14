import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from './services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prj-sktpj';
  private platformId: Object;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    public http: HttpClient,
    private router: Router,
    public userService: UserService,
    private authService: AuthService // Tambahkan ini
  ) {
    this.platformId = platformId;
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('AuthService - isBrowser:', this.isBrowser);
  }
  
  

  ngOnInit() {
    // Menunda pengecekan platform untuk memastikan eksekusi hanya di browser
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
      console.log('App is running on the client, calling autoAuthUser.');
      this.authService.autoAuthUser();
    } else {
      this.isBrowser = false;
      console.warn('App is running on the server, skipping autoAuthUser.');
    }
  
    console.log('AuthService - isAuthenticated:', this.authService.getIsAuth());
  }  
  
  
}
