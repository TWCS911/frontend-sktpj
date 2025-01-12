import { Component, OnDestroy, OnInit, OnChanges, AfterViewInit, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BarangService } from '../services/barang.service';
import { Barang } from '../models/barang.model';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-barang',
  standalone: false,
  templateUrl: './barang.component.html',
  styleUrls: ['./barang.component.css'],
})
export class BarangComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() refreshBarang: boolean = false; // Properti untuk memicu ngOnChanges

  isLoading: boolean = false;
  filteredBarangList: Barang[] = [];
  barangList: Barang[] = [];
  searchQuery: string = '';
  newBarang = {
    jenis: '',
    satuan: '',
    merk: '',
    nama: '',
    stok: 0,
    harga: 0
  };
  private getBarangSub: Subscription = new Subscription();
  private messageSub: Subscription = new Subscription();
  messageExecute: string = '';

  mode: string = 'Simpan';

  // Pagination
  p: number = 1;

  constructor(
    public barangService: BarangService,
    private cdRef: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
    console.log('Constructor dipanggil');
  }

  ngOnInit(): void {
    console.log('ngOnInit dipanggil');

    if (typeof window !== 'undefined' && window.localStorage) {
      const storedBarangList = localStorage.getItem('barangList');
      if (storedBarangList) {
        this.barangList = JSON.parse(storedBarangList);
        this.filteredBarangList = this.barangList;
      } else {
        this.barangService.getBarang();
      }
    }

    // Mendengarkan data barang dari service
    this.getBarangSub = this.barangService.getBarangListener().subscribe({
      next: (value: Barang[]) => {
        console.log('Data Barang diterima:', value); // Pastikan data baru diterima
        this.barangList = value;
        this.filteredBarangList = value; // Update barangList
        this.cdRef.detectChanges(); // Memaksa deteksi perubahan UI

        // Simpan data barang yang diterima ke localStorage
        localStorage.setItem('barangList', JSON.stringify(value));
      },
      error: (err) => {
        console.error('Gagal mendapatkan data barang:', err);
      },
    });

    // Mendengarkan pesan eksekusi dari service
    this.messageSub = this.barangService.executeBarangListener().subscribe({
      next: (value) => {
        console.log('Pesan Eksekusi:', value); // Debugging
        this.messageExecute = value;
      },
    });

    // Memastikan data barang diambil dari API atau localStorage
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges dipanggil:', changes);

    if (changes['refreshBarang'] && changes['refreshBarang'].currentValue === true) {
      console.log('refreshBarang berubah, mengambil ulang data barang...');
      this.barangService.getBarang();
    }
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit dipanggil');
  }

  searchBarang() {
    // Jika searchQuery kosong, tampilkan semua barang
    if (this.searchQuery.trim() === '') {
      this.filteredBarangList = this.barangList;  // Kembalikan ke seluruh barang
    } else {
      // Jika ada searchQuery, lakukan pencarian berdasarkan beberapa field
      this.filteredBarangList = this.barangList.filter(barang => 
        barang.nama.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        barang.merk.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        barang.jenis.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        barang.satuan.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  tambahBarang() {
    this.isLoading = true; // Tampilkan indikator loading sebelum memulai proses
  
    // Kirim barang baru ke backend menggunakan service
    this.barangService.addBarang(
      this.newBarang.jenis,
      this.newBarang.satuan,
      this.newBarang.merk,
      this.newBarang.nama,
      this.newBarang.stok,
      this.newBarang.harga
    ).subscribe({
      next: (response) => {
        this.isLoading = false; // Sembunyikan indikator loading setelah berhasil
  
        Swal.fire({
          title: 'Barang Ditambahkan!',
          text: `Barang ${this.newBarang.nama} berhasil ditambahkan.`,
          icon: 'success',
          confirmButtonText: 'OK',
        });
  
        // Setelah berhasil ditambahkan, ambil kembali data barang terbaru
        this.barangService.getBarang(); // Memanggil method untuk mengambil data terbaru dari server
  
        // Reset form setelah barang ditambahkan
        this.newBarang = {
          jenis: '',
          satuan: '',
          merk: '',
          nama: '',
          stok: 0,
          harga: 0,
        };
      },
      error: (err) => {
        this.isLoading = false; // Sembunyikan indikator loading jika terjadi error
  
        console.error('Gagal menambahkan barang:', err);
        Swal.fire({
          title: 'Error',
          text: 'Terjadi kesalahan saat menambahkan barang.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }
  
  

  tampilkanFormTambah() {
    Swal.fire({
      title: 'Tambah Data Barang',
      html: `
        <form id="tambahBarangForm" class="form-add-barang">
          <div class="form-group mb-3"> <!-- Menambahkan margin-bottom untuk jarak antar form -->
            <div class="input-group">
              <span class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M7 12h3v4h-3z" />
                  <path d="M10 6h-6a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1 -1v-12a1 1 0 0 0 -1 -1h-6" />
                  <path d="M10 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
                </svg>
              </span>
              <input type="text" id="jenis" class="form-control" placeholder="Jenis Barang" required>
            </div>
          </div>
          <div class="form-group mb-3">
            <div class="input-group">
              <span class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                </svg>
              </span>
              <input type="text" id="satuan" class="form-control" placeholder="Satuan Barang" required>
            </div>
          </div>
          <div class="form-group mb-3">
            <div class="input-group">
              <span class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
                  <path d="M3 7l9 6l9 -6" />
                </svg>
              </span>
              <input type="text" id="merk" class="form-control" placeholder="Merk Barang" required>
            </div>
          </div>
          <div class="form-group mb-3">
            <div class="input-group">
              <span class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M10 12h4v4h-4z" />
                  <path d="M10 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
                  <path d="M10 15h-6a1 1 0 0 0 -1 1v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1 -1v-4a1 1 0 0 0 -1 -1h-6" />
                </svg>
              </span>
              <input type="text" id="nama" class="form-control" placeholder="Nama Barang" required>
            </div>
          </div>
          <div class="form-group mb-3">
            <div class="input-group">
              <span class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 8a1 1 0 0 1 1 1v2h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-3v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2h-3a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h3v-2a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2h3z" />
                </svg>
              </span>
              <input type="number" id="stok" class="form-control" placeholder="Stok Barang" required>
            </div>
          </div>
          <div class="form-group mb-3">
            <div class="input-group">
              <span class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4 9h16v6h-16z" />
                </svg>
              </span>
              <input type="number" id="harga" class="form-control" placeholder="Harga Barang" required>
            </div>
          </div>
        </form>
      `,
      focusConfirm: false,
      width: '600px',
      padding: '30px',
      customClass: { popup: 'popup-form', title: 'title-form', input: 'input-form', actions: 'actions-form' },
      showConfirmButton: true,
      confirmButtonText: 'Simpan',
      confirmButtonColor: '#28a745',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      cancelButtonColor: '#d33',
      preConfirm: () => {
        const jenis = (document.getElementById('jenis') as HTMLInputElement).value;
        const satuan = (document.getElementById('satuan') as HTMLInputElement).value;
        const merk = (document.getElementById('merk') as HTMLInputElement).value;
        const nama = (document.getElementById('nama') as HTMLInputElement).value;
        const stok = parseInt((document.getElementById('stok') as HTMLInputElement).value);
        const harga = parseInt((document.getElementById('harga') as HTMLInputElement).value);

        if (!jenis || !satuan || !merk || !nama || isNaN(stok) || isNaN(harga)) {
          Swal.showValidationMessage('Semua kolom harus diisi dengan benar');
          return false;
        }

        this.newBarang = { jenis, satuan, merk, nama, stok, harga };
        this.tambahBarang(); // Tambahkan barang baru ke daftar

        // Menampilkan notifikasi setelah barang ditambahkan
        Swal.fire({
          title: 'Barang Ditambahkan!',
          text: `Barang ${this.newBarang.nama} berhasil ditambahkan.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });

        return true;
      }
    });

    const style = document.createElement('style');
    style.innerHTML = `
      .title-form {
        color: #8c54fc;
      }
    `;
    document.head.appendChild(style);
  }
  

  tampilData(barang: Barang, form: NgForm): void {
    console.log('tampilData dipanggil dengan barang:', barang);
    form.setValue({
      id: barang._id,
      jenis: barang.jenis,
      satuan: barang.satuan,
      merk: barang.merk,
      nama: barang.nama,
      stok: barang.stok,
      harga: barang.harga,
    });

    this.mode = 'Perbaiki';
  }

  onReset(): void {
    this.mode = 'Simpan';
    this.messageExecute = '';
    console.log('Form di-reset'); // Debugging
  }

  // simpanBarang(form: NgForm): void {
  //   if (form.invalid) {
  //     console.log('Form tidak valid'); // Debugging
  //     return;
  //   }

  //   if (this.mode.toUpperCase() === 'SIMPAN') {
  //     console.log('Menambahkan barang baru:', form.value);
  //     this.barangService.addBarang(
  //       form.value.jenis,
  //       form.value.satuan,
  //       form.value.merk,
  //       form.value.nama,
  //       form.value.stok,
  //       form.value.harga
  //     );
  //   } else {
  //     console.log('Memperbarui barang:', form.value);
  //     this.barangService.updateBarang(
  //       form.value.jenis,
  //       form.value.satuan,
  //       form.value.merk,
  //       form.value.nama,
  //       form.value.stok,
  //       form.value.harga,
  //       form.value.id
  //     );
  //   }

  //   form.resetForm();
  //   this.mode = 'Simpan';
  //   console.log('Form berhasil disimpan atau diperbarui'); // Debugging
  // }

  tampilkanFormUpdate(
    id: string,
    jenis: string,
    satuan: string,
    merk: string,
    nama: string,
    stok: number,
    harga: number
  ): void {
    Swal.fire({
      title: 'Update Data Barang',
      html: `
      <form id="updateBarangForm" class="form-update-barang">
        <div class="form-group mb-3">
        <div class="input-group">
          <span class="input-group-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 12h3v4h-3z" />
            <path d="M10 6h-6a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1 -1v-12a1 1 0 0 0 -1 -1h-6" />
            <path d="M10 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
          </svg>
          </span>
          <input type="text" id="jenis" class="form-control" value="${jenis}" placeholder="Jenis Barang" required>
        </div>
        </div>
        <div class="form-group mb-3">
        <div class="input-group">
          <span class="input-group-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
          </svg>
          </span>
          <input type="text" id="satuan" class="form-control" value="${satuan}" placeholder="Satuan Barang" required>
        </div>
        </div>
        <div class="form-group mb-3">
        <div class="input-group">
          <span class="input-group-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
            <path d="M3 7l9 6l9 -6" />
          </svg>
          </span>
          <input type="text" id="merk" class="form-control" value="${merk}" placeholder="Merk Barang" required>
        </div>
        </div>
        <div class="form-group mb-3">
        <div class="input-group">
          <span class="input-group-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 12h4v4h-4z" />
            <path d="M10 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
            <path d="M10 15h-6a1 1 0 0 0 -1 1v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1 -1v-4a1 1 0 0 0 -1 -1h-6" />
          </svg>
          </span>
          <input type="text" id="nama" class="form-control" value="${nama}" placeholder="Nama Barang" required>
        </div>
        </div>
        <div class="form-group mb-3">
        <div class="input-group">
          <span class="input-group-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 8a1 1 0 0 1 1 1v2h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-3v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2h-3a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h3v-2a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2h3z" />
          </svg>
          </span>
          <input type="number" id="stok" class="form-control" value="${stok}" placeholder="Stok Barang" required>
        </div>
        </div>
        <div class="form-group mb-3">
        <div class="input-group">
          <span class="input-group-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 9h16v6h-16z" />
          </svg>
          </span>
          <input type="number" id="harga" class="form-control" value="${harga}" placeholder="Harga Barang" required>
        </div>
        </div>
      </form>
      `,
      focusConfirm: false,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: (): Partial<Barang> | false => {
      const jenis = (document.getElementById('jenis') as HTMLInputElement).value;
      const satuan = (document.getElementById('satuan') as HTMLInputElement).value;
      const merk = (document.getElementById('merk') as HTMLInputElement).value;
      const nama = (document.getElementById('nama') as HTMLInputElement).value;
      const stok = parseInt((document.getElementById('stok') as HTMLInputElement).value);
      const harga = parseInt((document.getElementById('harga') as HTMLInputElement).value);
    
      if (!jenis || !satuan || !merk || !nama || isNaN(stok) || isNaN(harga)) {
        Swal.showValidationMessage('Semua field harus diisi!');
        return false;
      }
    
      return { jenis, satuan, merk, nama, stok, harga };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
      const updatedData = result.value as Partial<Barang>;
      // Panggil fungsi updateBarang dengan data yang diperbarui
      this.updateBarang(id, { 
        _id: id, 
        jenis: updatedData.jenis!, 
        satuan: updatedData.satuan!, 
        merk: updatedData.merk!, 
        nama: updatedData.nama!, 
        stok: updatedData.stok!, 
        harga: updatedData.harga! 
      });
      Swal.fire('Berhasil!', 'Data barang berhasil diperbarui.', 'success');
      }
    });
  }

  
  

  updateBarang(id: string, barang: Barang): void {
      // Panggil fungsi updateBarang dari service
      this.barangService.updateBarang(id, barang.jenis, barang.satuan, barang.merk, barang.nama, barang.stok, barang.harga);
  
      // Notifikasi Sukses
      Swal.fire('Berhasil', 'Data barang berhasil diperbarui!', 'success');
    }

  hapusBarang(barang: Barang): void {
    console.log('Menghapus barang:', barang);
    
    // Menggunakan SweetAlert2 untuk konfirmasi
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda akan menghapus barang: ' + barang.nama,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Jika pengguna menekan tombol "Ya, Hapus!", hapus barang
        this.barangService.deleteBarang(barang);
        Swal.fire(
          'Dihapus!',
          'Barang telah dihapus.',
          'success'
        );
      }
    });
  }
  trackById(index: number, item: Barang): string {
    return item._id ?? ''; // Menyediakan identifier unik untuk setiap elemen
  }
  
}
