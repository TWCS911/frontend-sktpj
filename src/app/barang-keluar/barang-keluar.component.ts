import { Component, OnDestroy, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { TransaksiService } from '../services/transaksi.service';
import { Barang } from '../models/barang.model';
import { Transaksi } from '../models/transaksi.model';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-barang-keluar',
  standalone: false,
  templateUrl: './barang-keluar.component.html',
  styleUrls: ['./barang-keluar.component.css'],
})
export class BarangKeluarComponent implements OnInit, OnDestroy {
  @Input() refreshBarangKeluar: boolean = false;

  isLoading: boolean = false;
  transaksiList: Transaksi[] = [];  // Ubah menjadi array Transaksi
  barangList: Barang[] = [];
  newBarangKeluar = {
    idBarang: '',      // ID barang yang dipilih
    jumlah: 0,
    penerima: '',
    keterangan: '',
    tanggalKeluar: new Date().toISOString().split('T')[0],
  };
  private barangSub: Subscription = new Subscription();
  private transaksiSub: Subscription = new Subscription();  // Ganti dengan transaksiSub

  // Pagination
  p: number = 1;

  constructor(
    private transaksiService: TransaksiService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBarang();
    this.loadTransaksi();  // Ganti dengan loadTransaksi
  }

  ngOnDestroy(): void {
    this.barangSub.unsubscribe();
    this.transaksiSub.unsubscribe();  // Ganti dengan transaksiSub
  }

  loadBarang(): void {
    this.transaksiService.getAllBarang().subscribe({
      next: (barang) => {
        this.barangList = barang;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Gagal memuat data barang:', err);
      },
    });
  }

  loadTransaksi(): void {  // Ganti dengan loadTransaksi
    this.transaksiService.getBarangKeluar().subscribe({
      next: (transaksi) => {
        this.transaksiList = transaksi;  // Menyimpan hasil ke transaksiList
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Gagal memuat data transaksi:', err);
      },
    });
  }

  tambahBarangKeluar(): void {
    if (!this.newBarangKeluar.idBarang || this.newBarangKeluar.jumlah <= 0 || !this.newBarangKeluar.penerima) {
      Swal.fire({
        title: 'Error',
        text: 'Pilih barang, masukkan jumlah yang valid, dan isi penerima.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isLoading = true;
    this.transaksiService.tambahBarangKeluar(
      this.newBarangKeluar.idBarang,
      this.newBarangKeluar.jumlah,
      this.newBarangKeluar.penerima,
      this.newBarangKeluar.keterangan
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Barang Keluar Ditambahkan',
          text: `Barang keluar berhasil ditambahkan.`,
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.loadTransaksi();  // Memuat ulang data transaksi
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Gagal menambahkan barang keluar:', err);
        Swal.fire({
          title: 'Error',
          text: 'Terjadi kesalahan saat menambahkan barang keluar.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  resetForm(): void {
    this.newBarangKeluar = {
      idBarang: '',
      jumlah: 0,
      penerima: '',
      keterangan: '',
      tanggalKeluar: new Date().toISOString().split('T')[0],
    };
  }

  deleteBarangKeluar(id: string): void {
    Swal.fire({
      title: 'Hapus Barang Keluar?',
      text: 'Apakah Anda yakin ingin menghapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.transaksiService.hapusBarangKeluar(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Terhapus!',
              text: 'Data barang keluar berhasil dihapus.',
              icon: 'success',
              confirmButtonText: 'OK',
            });
            this.loadTransaksi();  // Memuat ulang data transaksi
          },
          error: (err) => {
            console.error('Gagal menghapus barang keluar:', err);
            Swal.fire({
              title: 'Error',
              text: 'Terjadi kesalahan saat menghapus barang keluar.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }
}
