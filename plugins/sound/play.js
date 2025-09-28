const axios = require('axios');

module.exports = {
    name: 'play',
    category: 'downloader',
    description: 'Mencari dan mengirim lagu dari YouTube.',
    register: true,
    run: async (sock, m, args) => {
        if (args.length === 0) {
            return m.reply('Gunakan format: *.play [judul lagu]*\nContoh: *.play stay with me miki matsubara*');
        }

        const query = args.join(' ');
        await m.reply(`🎧 Sedang mencari lagu *"${query}"*...`);

        try {
            const apiUrl = `https://anabot.my.id/api/download/playmusic?query=${encodeURIComponent(query)}&apikey=freeApikey`;
            const response = await axios.get(apiUrl);
            const result = response.data;

            if (!result.success || !result.data || !result.data.result.success) {
                return m.reply(`Maaf, lagu "${query}" tidak ditemukan atau terjadi kesalahan pada API.`);
            }

            const { metadata, urls } = result.data.result;
            const infoCaption = `*🎵 Judul:* ${metadata.title}\n*🎤 Channel:* ${metadata.channel}\n*⏳ Durasi:* ${metadata.duration}\n\nSedang mengirim audio, mohon tunggu...`;
            
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: metadata.thumbnail },
                caption: infoCaption,
                footer: global.settings.botName
            }, { quoted: m, ai: true });

            await sock.sendMessage(m.key.remoteJid, {
                audio: { url: urls },
                mimetype: 'audio/mpeg'
            }, { quoted: m, ai: true });

        } catch (error) {
            console.error('Error pada fitur Play:', error.response ? error.response.data : error.message);
            m.reply(`Terjadi error: ${error.message}. Mungkin API sedang bermasalah atau lagu tidak dapat diakses.`);
        }
    }
};
