<div align="center">
  <img src="https://files.catbox.moe/h7i904.jpg" alt="Foss Line Logo" width="200"/>
  <h1>Base Bot WhatsApp</h1>
  <p>Base WhatsApp Bot modular menggunakan Node.js dan Baileys. Cocok sebagai fondasi untuk membuat bot sesuai kebutuhan Anda.</p>
  
  <p>
    <img src="https://img.shields.io/github/stars/senzuXD12/Base-Bot-whatsapp-?style=for-the-badge&logo=github" alt="GitHub Stars"/>
    <img src="https://img.shields.io/github/forks/senzuXD12/Base-Bot-whatsapp-?style=for-the-badge&logo=github" alt="GitHub Forks"/>
    <img src="https://img.shields.io/github/license/senzuXD12/Base-Bot-whatsapp-?style=for-the-badge" alt="License"/>
  </p>
</div>

---

## 📋 Daftar Isi

- [Persiapan Awal](#-persiapan-awal)
- [Instalasi](#-instalasi)
- [Struktur Folder](#-struktur-folder)
- [Cara Membuat Plugin Baru](#-cara-membuat-plugin-baru)
- [Lisensi](#-lisensi)
- [Catatan](#-catatan)

---

## 🔧 Persiapan Awal

1. **Node.js** versi 18 (LTS) atau yang lebih baru.  
2. **Git** untuk clone repositori.  
3. **FFmpeg** (dibutuhkan untuk fitur media).  

---

## 🚀 Instalasi

```bash
git clone https://github.com/senzuXD12/Base-Bot-whatsapp-.git
cd Base-Bot-whatsapp-
npm install
```

Edit file `settings.js` dan masukkan nomor Owner Anda (`628...`).  
Lalu jalankan:

```bash
node index.js
```

---

## 📂 Struktur Folder

- `plugins/` → folder utama berisi fitur/perintah.  
- `database/` → penyimpanan data JSON.  
- `lib/` → fungsi helper.  
- `session/` → sesi login WhatsApp.  
- `index.js` → file utama bot.  
- `settings.js` → konfigurasi bot.  

---

## 🛠️ Cara Membuat Plugin Baru

Cukup buat file baru di dalam folder `plugins/`.  
Gunakan template berikut:

**Contoh: `plugins/main/tes.js`**
```javascript
module.exports = {
    name: "tes",
    category: "main",
    description: "Perintah untuk testing.",

    register: true, // fitur hanya untuk pengguna terdaftar
    premium: false, // fitur hanya untuk premium
    owner: false, // hanya untuk owner
    pass: null, // fitur memerlukan pass contoh pass: admin123,
    auth: false, // fitur memerlukan otoritas/persetujuan owner
    hidden: false, // menyembunyikan fitur dari menu

    run: async (sock, m, args, { userFromDb, isOwner, isPremium }) => {
        try {
            const nama = userFromDb ? userFromDb.name : "Pengguna Tidak Dikenal";
            await m.reply(`Halo ${nama}! Perintah .tes berhasil dijalankan.`);
        } catch (err) {
            console.error(err);
            await m.reply(`Terjadi kesalahan: ${err.message}`);
        }
    }
};
```

---

## 📜 Lisensi

Project ini menggunakan **GNU GPL v3.0**.  
Anda bebas menggunakan dan mengembangkan ulang sesuai lisensi.  

---

## 📝 Catatan

- Project ini **masih mendapat update**, tapi **tidak terlalu aktif**.  
- Tujuan utamanya hanya sebagai **base bot WhatsApp** yang bisa dikembangkan sesuai kebutuhan.
