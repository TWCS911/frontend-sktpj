import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = environment.api + 'users/';
  private subjectExecuteUser = new Subject<string>();

  constructor(public http: HttpClient) {}

  // Observable untuk listen perubahan
  executeUserListener() {
    return this.subjectExecuteUser.asObservable();
  }

  // Menambahkan user baru
  addUser(email: string, password: string): Observable<{ message: string }> {
    const user = { email, password };
    return this.http.post<{ message: string }>(this.url, user);
  }

  // Mengambil data user menggunakan token autentikasi
  fetchUserData(token: string): Observable<{ message: string }> {
    console.log('Fetching user data with token:', token);
    return this.http.get<{ message: string }>(this.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
