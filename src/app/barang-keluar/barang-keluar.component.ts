import { Component, OnInit } from '@angular/core';
import { TransaksiService } from '../services/transaksi.service';
import { BarangService } from '../services/barang.service';
import { Barang } from '../models/barang.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barang-keluar',
  standalone: false,
  templateUrl: './barang-keluar.component.html',
  styleUrls: ['./barang-keluar.component.css']
})
export class BarangKeluarComponent implements OnInit {
  barangList: Barang[] = [];
  transaksiList: any[] = []; // Daftar transaksi barang keluar
  filteredBarangKeluarList: any[] = []; // Daftar barang keluar yang sudah difilter
  selectedBarangId: string = '';
  jumlah: number = 0;
  penerima: string = '';
  keterangan: string = '';
  searchQuery: string = ''; // Untuk pencarian barang keluar
  p: number = 1; // Pagination

  constructor(
    private transaksiService: TransaksiService,
    private barangService: BarangService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBarangList();
    this.loadBarangKeluar();
  }

  // Memuat daftar barang dari BarangService
  loadBarangList(): void {
    this.barangService.getBarang();
    this.barangService.getBarangListener().subscribe(
      (data) => {
        this.barangList = data;
      },
      (error) => {
        console.error('Error loading barang list!', error);
      }
    );
  }

  // Memuat daftar barang keluar dari TransaksiService
  loadBarangKeluar(): void {
    this.transaksiService.getBarangKeluar().subscribe(
      (data) => {
        this.transaksiList = data;
        this.filteredBarangKeluarList = data;
      },
      (error) => {
        console.error('Error loading barang keluar!', error);
      }
    );
  }

  // Fungsi untuk menambah barang keluar
  tampilkanFormTambah(): void {
    Swal.fire({
      title: 'Tambah Barang Keluar',
      html: `
        <div class="form-group mb-3">
          <!-- Select untuk memilih barang -->
          <select id="barangSelect" class="form-control" style="margin-top: 10px;">
            <option value="">-- Pilih Barang --</option>
            ${this.barangList.map(barang => `
              <option value="${barang._id}">${barang.nama} - ${barang.merk}</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group mb-3">
          <input type="number" id="jumlahInput" class="form-control" min="1" placeholder="Jumlah barang">
        </div>
        <div class="form-group mb-3">
          <input type="text" id="penerimaInput" class="form-control" placeholder="Masukkan nama penerima">
        </div>
        <div class="form-group mb-3">
          <input type="text" id="keteranganInput" class="form-control" placeholder="Masukkan keterangan">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const selectedBarangId = (document.getElementById('barangSelect') as HTMLSelectElement).value;
        const jumlah = (document.getElementById('jumlahInput') as HTMLInputElement).value;
        const penerima = (document.getElementById('penerimaInput') as HTMLInputElement).value;
        const keterangan = (document.getElementById('keteranganInput') as HTMLInputElement).value;

        if (!selectedBarangId || !jumlah || parseInt(jumlah) <= 0 || !penerima) {
          Swal.showValidationMessage('Harap isi semua field dengan benar!');
          return false;
        }

        return { selectedBarangId, jumlah: parseInt(jumlah), penerima, keterangan };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { selectedBarangId, jumlah, penerima, keterangan } = result.value;
        this.transaksiService.tambahBarangKeluar(selectedBarangId, jumlah, penerima, keterangan).subscribe(
          () => {
            Swal.fire({
              title: 'Berhasil!',
              text: 'Barang keluar berhasil ditambahkan.',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              this.router.navigate(['/admin']);
            });
          },
          (error) => {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat menambahkan barang keluar.', 'error');
            console.error(error);
          }
        );
      }
    });
  }

  // Fungsi untuk pencarian barang keluar
  searchBarangKeluar(): void {
    if (this.searchQuery.trim()) {
      this.filteredBarangKeluarList = this.transaksiList.filter((transaksi) =>
        transaksi.barang.nama.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        transaksi.barang.merk.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        transaksi.barang.jenis.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        transaksi.penerima.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        transaksi.keterangan.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredBarangKeluarList = this.transaksiList;
    }
  }

  trackById(index: number, item: any): string {
    return item._id; // Menggunakan _id dari transaksi untuk trackBy
  }

  paginate(pageNumber: number): void {
    this.p = pageNumber; // Menetapkan halaman yang dipilih
  }
}
