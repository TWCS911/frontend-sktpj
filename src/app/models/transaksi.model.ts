import { Barang } from "./barang.model";

export interface Transaksi {
    _id : string | null,
    barang : Barang,
    jumlah : number,
    keterangan : string,
    penerima : string,
    tanggalMasuk : Date,
    tanggalKeluar : Date
}