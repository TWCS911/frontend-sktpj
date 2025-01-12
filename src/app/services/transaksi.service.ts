import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { BarangService } from './barang.service';
import { Barang } from '../models/barang.model';

// URL API backend
@Injectable({
  providedIn: 'root'
})
export class TransaksiService {
  private url: string = environment.api + 'transaksi/';

  constructor(
    private http: HttpClient,
    private barangService: BarangService  // Inject BarangService
  ) {}

  // Mendapatkan Daftar Barang dari BarangService
  getAllBarang(): Observable<Barang[]> {
    return this.barangService.getBarangListener();  // Mendapatkan data barang dari subject
  }

  // Menambahkan Barang Masuk
  tambahBarangMasuk(barangId: string, jumlah: number, keterangan: string): Observable<any> {
    const payload = {
      barang: barangId,  // Menyimpan ID barang yang dipilih
      jumlah,
      keterangan
    };

    return this.http.post(`${this.url}barang-masuk`, payload);
  }

  // Mendapatkan Semua Barang Masuk
  getBarangMasuk(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}barang-masuk`);
  }

  // Menghapus Barang Masuk
  hapusBarangMasuk(id: string): Observable<any> {
    return this.http.delete(`${this.url}barang-masuk/${id}`);
  }

  // Menambahkan Barang Keluar
  tambahBarangKeluar(barangId: string, jumlah: number, penerima: string, keterangan: string): Observable<any> {
    const payload = {
      barang: barangId,  // Menyimpan ID barang yang dipilih
      jumlah,
      penerima,
      keterangan
    };

    return this.http.post(`${this.url}barang-keluar`, payload);
  }

  // Mendapatkan Semua Barang Keluar
  getBarangKeluar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}barang-keluar`);
  }

  // Menghapus Barang Keluar
  hapusBarangKeluar(id: string): Observable<any> {
    return this.http.delete(`${this.url}barang-keluar/${id}`);
  }
}