import { Injectable } from '@angular/core';
import { Barang } from '../models/barang.model';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { ResponseAPI } from '../interfaces/response-api';
import Swal from 'sweetalert2';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import axios from 'axios';



@Injectable({
  providedIn: 'root',
})
export class BarangService {
  //private url: string = 'http://localhost:3000/barang/';
  private url: string = environment.api + 'barang/';

  private subjectBarang = new Subject<Barang[]>();
  private subjectExecute = new Subject<string>();


  constructor(private http: HttpClient) {}

  getDashboardStats() {
    return this.http.get<{ 
      message: string; 
      totalBarang: number;
      totalJenis: number;
      totalSatuan: number;
      totalMerk: number;
      totalMasuk: number;
      totalKeluar: number;
    }>(`${this.url}stats`);
  }

  executeBarangListener() {
    return this.subjectExecute.asObservable();
  }

  getBarangListener() {
    return this.subjectBarang.asObservable();
  }

  getBarang() {
    this.http
      .get<{ message: string; barangs: Barang[] }>(this.url)
      .subscribe((value) => {
        console.log(value);
        this.subjectBarang.next(value.barangs);
      });
  }

  addBarang(jenis: string, satuan: string, merk: string, nama: string, stok: number, harga: number) {
    const barang: Barang = {
      _id: null, // _id bisa diisi oleh backend setelah disimpan
      jenis: jenis,
      satuan: satuan,
      merk: merk,
      nama: nama,
      stok: stok,
      harga: harga,
    };
  
    // Mengirim data barang ke API (backend)
    return this.http.post<ResponseAPI>(this.url, barang).pipe(
      // Jika berhasil, kembalikan data response dan proses lanjutan bisa dilakukan di komponen
      tap((response) => {
        // Setelah barang berhasil ditambahkan, ambil kembali daftar barang terbaru dari server
        this.getBarang(); // Memanggil method untuk mengambil data barang terbaru dari backend
  
        // Menyampaikan pesan eksekusi ke listener
        this.subjectExecute.next(response.message);
  
        // Menampilkan pesan sukses
        console.log(response.message);
      }),
      // Tangani error jika terjadi masalah saat mengirim data ke backend
      catchError((err) => {
        console.error('Terjadi kesalahan saat menambahkan barang:', err);
        Swal.fire({
          title: 'Error',
          text: 'Gagal menambahkan barang.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
  
        // Kembalikan observable kosong atau error sesuai kebutuhan
        return throwError(() => new Error('Gagal menambahkan barang.'));
      })
    );
  }
  
  

  deleteBarang(barang: Barang) {
    this.http
      .delete<{ message: string }>(this.url + barang._id)
      .subscribe((response) => {
        //console.log(response.message);
        this.getBarang();
        this.subjectExecute.next(response.message);
      });
  }

  updateBarang(id: string, jenis: string, satuan: string, merk: string, nama: string, stok: number, harga: number) {
    const barang: Barang = {
      _id: id,
      jenis: jenis,
      satuan: satuan,
      merk: merk,
      nama: nama,
      stok: stok,
      harga: harga,
    };
  
    this.http
      .put<{ message: string }>(`${this.url}/${id}`, barang)
      .subscribe((response) => {
        console.log('Barang berhasil diupdate:', response);
        this.getBarang(); // Update list barang
        this.subjectExecute.next(response.message);
      });
  }
  
}
