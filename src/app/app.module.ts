import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Pastikan ini diimpor
import { HttpClientModule } from '@angular/common/http';
import { BarangComponent } from './barang/barang.component'; // Pastikan ini juga benar
import { BarangMasukComponent } from './barang-masuk/barang-masuk.component';
import { BarangKeluarComponent } from './barang-keluar/barang-keluar.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoginComponent } from './login/login.component';
import { BarangService } from './services/barang.service';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    DashboardComponent,
    BarangMasukComponent,
    BarangKeluarComponent,
    BarangComponent,
    LoginComponent,
    RegisterComponent, // Pastikan BarangComponent ada di sini
  ],
  imports: [
    BrowserModule,
    NgSelectModule,
    AppRoutingModule,
    FormsModule,  // Pastikan FormsModule ada di sini
    HttpClientModule,
    NgxPaginationModule,
    CommonModule,  // BarangComponent diimpor di sini
    ReactiveFormsModule
  ],
  providers: [BarangService],
  bootstrap: [AppComponent]
})
export class AppModule { }
