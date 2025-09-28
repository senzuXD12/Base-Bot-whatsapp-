<div align="center">
  <img src="https://i.ibb.co/684bLd3/side-view-of-a-black-lynx-with-a-yellow-background-960351-43.jpg" alt="Foss Line Logo" width="200"/>
  <h1>Base Bot WhatsApp</h1>
  <p>Sebuah base bot WhatsApp modular yang canggih, dibuat menggunakan Node.js dan Baileys. Dilengkapi dengan sistem plugin yang mudah dikembangkan, manajemen pengguna, dan berbagai fitur keamanan.</p>
  
  <p>
    <img src="https://img.shields.io/github/stars/senzuXD12/Base-Bot-whatsapp-?style=for-the-badge&logo=github" alt="GitHub Stars"/>
    <img src="https://img.shields.io/github/forks/senzuXD12/Base-Bot-whatsapp-?style=for-the-badge&logo=github" alt="GitHub Forks"/>
    <img src="https://img.shields.io/github/license/senzuXD12/Base-Bot-whatsapp-?style=for-the-badge" alt="License"/>
  </p>
</div>

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Persiapan Awal](#-persiapan-awal)
- [Instalasi](#-instalasi)
  - [Di VPS / Panel Hosting (Direkomendasikan)](#-di-vps--panel-hosting-direkomendasikan)
  - [Di Termux](#-di-termux)
- [Struktur Folder](#-struktur-folder)
- [Cara Membuat Plugin Baru](#-cara-membuat-plugin-baru)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

Bot ini dirancang untuk menjadi fondasi yang kuat dan mudah dikembangkan. Fitur-fitur utamanya meliputi:

* **Sistem Plugin Modular:** Tambah, edit, atau hapus fitur dengan mudah hanya dengan mengelola file di dalam folder `plugins`.
* **Auto-Reload:** Tidak perlu me-restart bot. Setiap perubahan pada folder `plugins` akan langsung dimuat secara otomatis.
* **Manajemen Pengguna:**
    * Sistem registrasi (`.register`).
    * Sistem pengguna **Premium** dengan masa berlaku.
* **Keamanan Perintah Tingkat Lanjut:**
    * `owner: true`: Perintah hanya untuk Owner.
    * `premium: true`: Perintah hanya untuk pengguna Premium.
    * `register: true`: Perintah hanya untuk pengguna terdaftar.
    * `pass: '...'`: Perintah yang dilindungi password.
    * `auth: true`: Perintah yang memerlukan otorisasi dari Owner sebelum dijalankan.
    * `hidden: true`: Sembunyikan perintah dari menu.
* **Fitur Owner Lengkap:**
    * `.cmd ($)`: Eksekusi perintah langsung di terminal server.
    * `.scupd`: Mode maintenance untuk menonaktifkan bot sementara bagi pengguna biasa.
    * `.addprem`: Menambah dan mengatur masa aktif pengguna premium.
* **Fitur Canggih:**
    * **Auto AI:** Mode chat AI yang bisa merespons teks dan gambar, dengan memori percakapan per sesi.
    * **Welcome & Leave Kustom:** Kartu ucapan selamat datang/tinggal yang dibuat secara dinamis menggunakan API.
    * **Berbagai Downloader:** YouTube (Audio & Video), Instagram, dan lainnya.
    * **Menu Interaktif:** Tampilan menu yang menarik dengan video, info bot, info pengguna, dan `externalAdReply`.

---

## 🔧 Persiapan Awal

Sebelum melakukan instalasi, pastikan Anda sudah menyiapkan hal-hal berikut:

1.  **Node.js:** Versi 18 (LTS) atau yang lebih baru.
2.  **Git:** Untuk melakukan *clone* pada repositori.
3.  **FFmpeg:** Diperlukan untuk beberapa fitur media.
    * Di VPS (Debian/Ubuntu): `sudo apt-get install ffmpeg`
    * Di Termux: `pkg install ffmpeg`

---

## 🚀 Instalasi

Pilih metode instalasi yang sesuai dengan lingkungan Anda.

### ➤ Di VPS / Panel Hosting (Direkomendasikan)

1.  **Clone Repositori:**
    ```bash
    git clone [https://github.com/senzuXD12/Base-Bot-whatsapp-.git](https://github.com/senzuXD12/Base-Bot-whatsapp-.git)
    cd Base-Bot-whatsapp-
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Konfigurasi:**
    Buka file `settings.js` dan sesuaikan isinya, terutama bagian `ownerNumbers`. Masukkan nomor WhatsApp Anda dengan format `628...` tanpa tanda `+` atau spasi.
    ```javascript
    // contoh di settings.js
    ownerNumbers: ["6281234567890"], 
    ```
4.  **Jalankan Bot:**
    * **Di Panel:** Cukup tekan tombol "Start".
    * **Di VPS (dengan PM2):**
        ```bash
        pm2 start index.js --name "fossbot"
        ```

### ➤ Di Termux

1.  **Siapkan Termux:**
    ```bash
    pkg update && pkg upgrade
    pkg install git nodejs-lts ffmpeg
    ```
2.  **Clone Repositori:**
    ```bash
    git clone [https://github.com/senzuXD12/Base-Bot-whatsapp-.git](https://github.com/senzuXD12/Base-Bot-whatsapp-.git)
    cd Base-Bot-whatsapp-
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Konfigurasi:**
    Sama seperti di atas, edit file `settings.js` dan masukkan nomor Owner Anda.
    ```bash
    nano settings.js 
    ```
5.  **Jalankan Bot:**
    ```bash
    node index.js
    ```
---

## 📂 Struktur Folder

* `plugins/`: Folder utama tempat semua fitur/perintah bot berada.
    * `main/`: Fitur-fitur utama.
    * `owner/`: Fitur khusus Owner.
    * `downloader/`: Fitur-fitur untuk mengunduh media.
    * `nsfw/`: Fitur-fitur NSFW.
* `database/`: Tempat penyimpanan data bot dalam format JSON.
* `lib/`: Berisi fungsi-fungsi pembantu (helpers) yang digunakan di banyak tempat.
* `session/`: Menyimpan sesi login Anda agar tidak perlu scan ulang.
* `index.js`: File utama untuk menjalankan bot.
* `handler.js`: File yang menangani dan memproses setiap pesan yang masuk.
* `settings.js`: Pusat semua konfigurasi bot.

---

## 🛠️ Cara Membuat Plugin Baru

Sistem bot ini sangat mudah dikembangkan. Cukup buat file baru di dalam subfolder `plugins` yang sesuai menggunakan template di bawah.

**File Contoh: `plugins/main/tes.js`**
```javascript
module.exports = {
    // Informasi Dasar
    name: "tes",
    category: "main",
    description: "Perintah untuk testing.",
    
    // Pengaturan Akses & Keamanan
    register: true,
    premium: false,
    owner: false,
    pass: null, // contoh: 'rahasia123'
    auth: false,
    hidden: false,

    // Fungsi Utama
    run: async (sock, m, args, { userFromDb, isOwner, isPremium }) => {
        try {
            const query = args.join(' ');
            const namaTerdaftar = userFromDb ? userFromDb.name : "Pengguna Tidak Dikenal";

            let replyText = `Halo, ${namaTerdaftar}!\n\nPerintah '.tes' berhasil dijalankan.`;
            
            await m.reply(replyText);

        } catch (error) {
            console.error(`Error pada perintah 'tes':`, error);
            await m.reply(`Terjadi kesalahan: ${error.message}`);
        }
    }
};
 
