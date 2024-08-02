# Symphony Testnet

Script ini digunakan untuk mengelola transaksi dan staking otomatis di jaringan Symphony.

## Fitur Program

1. **Mengirim Otomatis**
2. **Stake Otomatis**

## Persyaratan Instalasi

1. **Node.js** dan **npm**
   - Pastikan Node.js dan npm sudah terinstal di sistem Anda.
   - Anda dapat mengunduh dan menginstal Node.js dari [nodejs.org](https://nodejs.org/).

2. **Menginstall Dependencies**
   - Buka terminal atau command prompt di direktori proyek Anda dan jalankan perintah berikut:
   ```bash
   npm install @cosmjs/proto-signing @cosmjs/stargate bip39 axios dotenv
   ```

## Penggunaan Program

1. **Clone Repository**
   - Clone repository dari GitHub ke komputer Anda.
   ```bash
   git clone https://github.com/0xbb22/symphony.git
   cd symphony
   ```

2. **Instal Dependencies**
   - Install semua modul yang diperlukan dengan menggunakan npm.
   ```bash
   npm install
   ```

3. **Buat File `.env`**
   - Buat file `.env` di direktori proyek Anda dan tambahkan mnemonic pribadi Anda ke dalam file tersebut.
   ```nano
   nano .env
   ```
   Dengan isi berikut :
   ```env
   MNEMONIC_SENDER=your_mnemonic_here
   ```
   Jika sudah selesai tekan `CTRL + X + Y + Enter`

4. **Jalankan Skrip**
   - Jalankan skrip dengan perintah berikut:
   ```bash
   node index.js
   ```

5. **Pilih Menu**
   - Anda akan melihat dua pilihan menu:
     1. Mengirim otomatis
     2. Stake otomatis
   - Masukkan pilihan Anda (1 atau 2) dan ikuti instruksi yang diberikan.

6. **Masukkan Jumlah Wallet atau Validator**
   - Jika Anda memilih opsi "Mengirim otomatis", masukkan jumlah wallet yang ingin dibuat dan dihasilkan.
   - Jika Anda memilih opsi "Stake otomatis", masukkan jumlah validator yang ingin di-stake.

7. **Masukkan Jumlah Token atau Alamat Validator**
   - Untuk pengiriman otomatis, masukkan jumlah token yang akan dikirim ke setiap alamat.
   - Untuk staking otomatis, pilih validator yang diinginkan dengan memasukkan nomor mereka.

8. **Ikuti Instruksi Selanjutnya**
   - Ikuti instruksi selanjutnya yang diberikan oleh program untuk menyelesaikan transaksi atau staking.

## Channel Telegram
Untuk informasi lebih lanjut dan diskusi, kunjungi channel Telegram kami:
[Channel: t.me/ugdairdrop](https://t.me/ugdairdrop)