import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prj-sktpj';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoAuthUser(); // Pastikan dipanggil di sini
  }
}
