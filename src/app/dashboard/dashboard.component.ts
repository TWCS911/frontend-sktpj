import { Component, OnInit } from '@angular/core';
import { BarangService } from '../services/barang.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalBarang: number = 0;
  totalJenis: number = 0;
  totalSatuan: number = 0;
  totalMerk: number = 0;
  totalMasuk: number = 0;
  totalKeluar: number = 0;

  constructor(private barangService: BarangService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.barangService.getDashboardStats().subscribe(
      (data) => {
        this.totalBarang = data.totalBarang;
        this.totalJenis = data.totalJenis;
        this.totalSatuan = data.totalSatuan;
        this.totalMerk = data.totalMerk;
        this.totalMasuk = data.totalMasuk;
        this.totalKeluar = data.totalKeluar;
      },
      (error) => {
        console.error("Error fetching dashboard stats:", error);
      }
    );
  }
}
