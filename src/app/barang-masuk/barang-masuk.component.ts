import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BarangService } from '../services/barang.service';
import { TransaksiService } from '../services/transaksi.service';
import { Barang } from '../models/barang.model';
import { Transaksi } from '../models/transaksi.model';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barang-masuk',
  standalone: false,
  templateUrl: './barang-masuk.component.html',
  styleUrls: ['./barang-masuk.component.css']
})
export class BarangMasukComponent implements OnInit, OnDestroy {
  barangList: Barang[] = []; // Daftar barang
  transaksiList: Transaksi[] = []; // Daftar transaksi barang masuk
  filteredBarangMasukList: Transaksi[] = []; // Barang yang sudah difilter berdasarkan pencarian
  selectedBarangId: string = ''; // ID barang yang dipilih
  jumlah: number = 0; // Jumlah barang yang masuk
  keterangan: string = ''; // Keterangan barang masuk
  searchQuery: string = ''; // Query pencarian untuk barang masuk
  p: number = 1; // Halaman untuk pagination (default 1)

  private getBarangSub: Subscription = new Subscription();
  private getTransaksiSub: Subscription = new Subscription();

  constructor(
    private barangService: BarangService,
    private transaksiService: TransaksiService,
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBarangList(); // Memuat daftar barang pada saat komponen dimuat
    this.loadTransaksiList(); // Memuat transaksi barang masuk
  }

  ngOnDestroy(): void {
    // Unsubscribe untuk mencegah memory leaks
    this.getBarangSub.unsubscribe();
    this.getTransaksiSub.unsubscribe();
  }

  // Memuat Daftar Barang dari BarangService
  loadBarangList(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Periksa apakah data barang sudah ada di localStorage
      const storedBarangList = localStorage.getItem('barangList');
      if (storedBarangList) {
        this.barangList = JSON.parse(storedBarangList);
      } else {
        // Jika tidak ada, ambil data dari API
        this.getBarangSub = this.barangService.getBarangListener().subscribe(
          (data) => {
            this.barangList = data;  // Menyimpan data barang yang diterima
            localStorage.setItem('barangList', JSON.stringify(data));  // Simpan ke localStorage
          },
          (error) => {
            console.error('Error loading barang list!', error);
          }
        );
        this.barangService.getBarang(); // Panggil API untuk mengambil data barang
      }
    } else {
      console.warn('localStorage is not available in this environment');
    }
  }

  // Memuat Daftar Transaksi Barang Masuk
  loadTransaksiList(): void {
    this.getTransaksiSub = this.transaksiService.getBarangMasuk().subscribe(
      (data: Transaksi[]) => {
        this.transaksiList = data;  // Menyimpan data transaksi yang diterima
        this.filteredBarangMasukList = this.transaksiList; // Menampilkan seluruh transaksi sebelum pencarian
      },
      (error) => {
        console.error('Error loading transaksi list!', error);
      }
    );
  }

  // Fungsi untuk mencari barang
  searchBarangMasuk(): void {
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
  
      this.filteredBarangMasukList = this.transaksiList.filter((transaksi) => {
        // Mengonversi tanggalMasuk ke format YYYY-MM-DD
        const tanggalMasuk = new Date(transaksi.tanggalMasuk);
        const formattedTanggalMasuk = tanggalMasuk instanceof Date && !isNaN(tanggalMasuk.getTime())
          ? tanggalMasuk.toISOString().split('T')[0] // Format sebagai YYYY-MM-DD
          : ''; // Jika tanggal tidak valid, berikan string kosong
  
        return (
          transaksi.barang.nama.toLowerCase().includes(query) ||
          transaksi.barang.merk.toLowerCase().includes(query) ||
          transaksi.barang.jenis.toLowerCase().includes(query) ||
          formattedTanggalMasuk.includes(query) || // Pencarian berdasarkan tanggal
          (transaksi.keterangan && transaksi.keterangan.toLowerCase().includes(query)) // Pencarian berdasarkan keterangan
        );
      });
    } else {
      this.filteredBarangMasukList = this.transaksiList; // Tampilkan seluruh transaksi jika pencarian kosong
    }
  }

  // Fungsi untuk menambah barang masuk
  tambahBarangMasuk(): void {
    if (this.selectedBarangId && this.jumlah > 0) {
      this.transaksiService.tambahBarangMasuk(this.selectedBarangId, this.jumlah, this.keterangan).subscribe(
        result => {
          console.log('Barang masuk berhasil ditambahkan!', result);
          // Setelah barang berhasil ditambahkan, muat ulang daftar transaksi
          this.loadTransaksiList();
        },
        error => {
          console.error('Error adding barang masuk!', error);
        }
      );
    } else {
      alert('Silakan pilih barang dan masukkan jumlah!');
    }
  }

  tampilkanFormTambah(): void {
    // Menampilkan modal SweetAlert2 dengan form input pencarian barang
    Swal.fire({
      title: 'Tambah Barang Masuk',
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
        <div class="form-group">
          <input type="text" id="keteranganInput" class="form-control" placeholder="Masukkan keterangan">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const selectedBarangId = (document.getElementById('barangSelect') as HTMLSelectElement).value;
        const jumlah = (document.getElementById('jumlahInput') as HTMLInputElement).value;
        const keterangan = (document.getElementById('keteranganInput') as HTMLInputElement).value;

        if (!selectedBarangId || !jumlah || parseInt(jumlah) <= 0) {
          Swal.showValidationMessage('Harap pilih barang dan masukkan jumlah yang valid!');
          return false; // Tidak melanjutkan proses jika data tidak valid
        }

        return { selectedBarangId, jumlah: parseInt(jumlah), keterangan };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { selectedBarangId, jumlah, keterangan } = result.value;
        // Menambahkan barang masuk melalui transaksiService
        this.transaksiService.tambahBarangMasuk(selectedBarangId, jumlah, keterangan).subscribe(
          (response) => {
            Swal.fire({
              title: 'Berhasil!',
              text: 'Barang masuk berhasil ditambahkan.',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              this.router.navigate(['/admin']);
            });
          },
          (error) => {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat menambahkan barang masuk.', 'error');
            console.error(error);
          }
        );
      }
    });
  }


  
  
  
  

  // Fungsi untuk mengoptimalkan render dengan trackBy
  trackById(index: number, item: any): string {
    return item._id; // Menggunakan _id dari transaksi untuk trackBy
  }

  // Fungsi untuk pagination
  paginate(pageNumber: number): void {
    this.p = pageNumber; // Menetapkan halaman yang dipilih
  }
}
