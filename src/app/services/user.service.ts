import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { response } from 'express';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // private url: string = 'http://localhost:3000/users/';
  private url: string = environment.api + 'users/';
  private subjectExecuteUser = new Subject<string>();

  constructor(public http: HttpClient) {}

  //observeable, subject
  executeUserListener() {
    return this.subjectExecuteUser.asObservable();
  }

  addUser(email: string, password: string): Observable<{ message: string }> {
    const user = { email, password };
    return this.http.post<{ message: string }>(this.url, user);
  }
  
}
