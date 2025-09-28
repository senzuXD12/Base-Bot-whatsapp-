const axios = require('axios');

module.exports = {
    name: 'igdl',
    category: 'downloader',
    description: 'Mengunduh video atau foto dari Instagram.',
    register: true,
    run: async (sock, m, args) => {
        if (!args[0]) {
            return m.reply('Format salah. Kirim perintah *.ig https://www.instagram.com/*');
        }

        const url = args[0];
        if (!url.includes('instagram.com')) {
            return m.reply('URL tidak valid. Pastikan Anda memasukkan URL dari Instagram.');
        }

        try {
            await m.reply('✨ Sedang mengambil data, mohon tunggu...');

            const response = await axios.get(`https://api.nekolabs.my.id/downloader/instagram?url=${encodeURIComponent(url)}`);
            const result = response.data;

            if (!result.status || !result.result || result.result.downloadUrl.length === 0) {
                return m.reply('Gagal mengunduh media. Pastikan link valid dan akun tidak di-private.');
            }

            const caption = result.result.metadata.caption || 'Tidak ada caption.';
            const mediaUrls = result.result.downloadUrl;

            for (let i = 0; i < mediaUrls.length; i++) {
                const mediaUrl = mediaUrls[i];
                const finalCaption = `*Caption:*\n${caption}\n\n*Media ke-${i + 1} dari ${mediaUrls.length}*`;

                if (result.result.metadata.isVideo) {
                    await sock.sendMessage(m.key.remoteJid, {
                        video: { url: mediaUrl },
                        caption: finalCaption
                    }, { quoted: m, ai: true });
                } else {
                    await sock.sendMessage(m.key.remoteJid, {
                        image: { url: mediaUrl },
                        caption: finalCaption
                    }, { quoted: m, ai: true });
                }
            }
        } catch (error) {
            console.error('Error pada fitur IG Downloader:', error);
            m.reply(`Terjadi error: ${error.message}. API mungkin sedang gangguan.`);
        }
    }
};