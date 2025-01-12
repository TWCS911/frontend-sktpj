import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { BarangService } from '../services/barang.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  executeState = '';
  showSpinner = false;
  private registerSub: Subscription = new Subscription();

  constructor(
    public userService: UserService,
    public barangService: BarangService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      },
      {
        validator: this.checkIfMatchingPasswords('password', 'confirmPassword'),
      }
    );
  }

  ngOnInit(): void {
    this.registerSub = this.userService
      .executeUserListener()
      .subscribe((value) => {
        //console.log(value);
        this.executeState = value;
        if (this.executeState != '') {
          this.showSpinner = false;
        }
      });
  }

  onSubmit(form: FormGroup) {
  this.submitted = true;
  this.showSpinner = true;

  if (form.invalid) {
    this.showSpinner = false;
    return;
  }

  // Panggil addUser dari userService
  this.userService.addUser(form.value.email, form.value.password).subscribe({
    next: (response) => {
      console.log('Akun berhasil dibuat:', response.message);

      // Navigasi ke halaman login dengan queryParams
      this.router.navigate(['/login'], { queryParams: { accountCreated: 'true' } });
    },
    error: (error) => {
      console.error('Gagal membuat akun:', error);
      this.showSpinner = false;

      // Tampilkan pesan error ke pengguna (opsional)
      alert(error.error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    },
    complete: () => {
      this.showSpinner = false;
    },
  });
}


  checkIfMatchingPasswords(
    passwordKey: string,
    passwordConfirmationKey: string
  ) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey];
      let passwordConfirmationInput = group.controls[passwordConfirmationKey];

      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notMatch: true });
      }
    };
  }
}
