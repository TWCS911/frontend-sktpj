import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  executeState = true;
  showSpinner = false;
  private loginSub: Subscription = new Subscription();
  accountCreated: boolean = false;
  accountCreatedMessage: string | null = null;

  constructor(private fb: FormBuilder, public authService: AuthService, private route: ActivatedRoute,) {
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.submitted = false;

    this.loginSub = this.authService.loginListener().subscribe((value) => {
      this.executeState = value;
      if (this.executeState == false) {
        this.showSpinner = false;
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params['accountCreated'] === 'true') {
        this.accountCreatedMessage = 'Akun berhasil dibuat! Silakan login.';
      }
    });
  }

  onSubmit(form: FormGroup) {
    this.submitted = true;
    this.showSpinner = true;
    this.executeState = true;
    if (form.invalid) {
      this.showSpinner = false;
      return;
    }

    this.authService.login(form.value.email, form.value.password);
  }
}