import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { BarangComponent } from './barang/barang.component';
import { BarangMasukComponent } from './barang-masuk/barang-masuk.component';
import { BarangKeluarComponent } from './barang-keluar/barang-keluar.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/auth-guard';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'barang',
        component: BarangComponent,
      },
      {
        path: 'bmasuk',
        component: BarangMasukComponent,
      },
      {
        path: 'bkeluar',
        component: BarangKeluarComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
