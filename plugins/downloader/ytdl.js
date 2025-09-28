const axios = require('axios');

module.exports = {
    name: 'ytmp4',
    category: 'downloader',
    description: 'Mengunduh video YouTube dalam format MP4 (720p).',
    register: true,
    run: async (sock, m, args) => {
        const url = args[0];

        if (!url) {
            return m.reply('Format salah. Kirim perintah *.ytmp4 https://www.youtube.com/*');
        }

        if (!url.includes('youtu.be') && !url.includes('youtube.com')) {
            return m.reply('URL yang Anda masukkan sepertinya bukan URL YouTube yang valid.');
        }

        try {
            await m.reply(`✨ Sedang memproses video 720p, mohon tunggu...`);

            const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=720`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            const result = response.data;

            if (!result.status || !result.result) {
                return m.reply('Gagal mengunduh video. Pastikan link valid dan video dapat diakses.');
            }

            const { title, cover, duration, download } = result.result;

            const infoCaption = `*Judul:* ${title}\n*Durasi:* ${duration}\n*Kualitas:* 720p\n\nSedang mengirim video... ⏳\n\n*Catatan:* Jika video berdurasi panjang, mungkin memerlukan beberapa menit.`;

            await sock.sendMessage(m.key.remoteJid, {
                image: { url: cover },
                caption: infoCaption
            }, { quoted: m });

            await sock.sendMessage(m.key.remoteJid, {
                video: { url: download },
                caption: `✅ Video *${title}* berhasil diunduh!`
            }, { quoted: m });

        } catch (error) {
            console.error('Error pada fitur YTMP4:', error.response ? error.response.data : error.message);
            m.reply(`Terjadi error: ${error.message}. API mungkin sedang bermasalah atau video 720p tidak tersedia.`);
        }
    }
};