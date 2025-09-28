// err pada saat menggunakan reply,malas fix

const { downloadMediaMessage } = require('@fadzzzslebew/baileys');
const axios = require('axios');
const { getSenderId, uploadImage } = require('../../lib/functions');

module.exports = {
    name: 'upscale',
    category: 'image',
    description: 'Meningkatkan resolusi gambar menjadi HD.',
    register: true,
    premium: true,
    run: async (sock, m, args) => {
        try {
            const scale = args[0];
            if (!['2', '4'].includes(scale)) {
                return m.reply('Format salah!\n\nGunakan:\n*• .upscale 2* (untuk skala 2x)\n*• .upscale 4* (untuk skala 4x)\n\nKirim perintah beserta gambar, atau balas gambar yang sudah ada.');
            }

            const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const isQuotedImage = quoted?.imageMessage;
            const isCurrentImage = m.message.imageMessage;

            if (!isQuotedImage && !isCurrentImage) {
                return m.reply('Gambar tidak ditemukan! Kirim gambar dengan caption *.upscale [2/4]* atau balas gambar yang ada.');
            }

            await m.reply(`⏳ Memproses upscale *${scale}x*... Ini bisa memakan waktu hingga 1 menit.`);

            let messageToDownload;
            if (isCurrentImage) {
                messageToDownload = m;
            } else if (isQuotedImage) {
                messageToDownload = {
                    key: {
                        remoteJid: m.key.remoteJid,
                        id: m.message.extendedTextMessage.contextInfo.stanzaId,
                        fromMe: m.message.extendedTextMessage.contextInfo.participant === sock.user.id.split(':')[0],
                        participant: m.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quoted
                };
            }
            // -----------------------------------------------------------
            
            const imageBuffer = await downloadMediaMessage(messageToDownload, 'buffer', {});
            const imageUrl = await uploadImage(imageBuffer);
            
            const apiUrl = `https://api.siputzx.my.id/api/iloveimg/upscale?image=${encodeURIComponent(imageUrl)}&scale=${scale}`;

            await sock.sendMessage(m.key.remoteJid, {
                image: { url: apiUrl },
                caption: `✅ Gambar berhasil di-upscale ${scale}x!`
            }, { quoted: m, ai: true });

        } catch (error) {
            console.error('Error pada fitur Upscale:', error);
            m.reply(`Terjadi kesalahan: ${error.message}. API mungkin sedang sibuk atau gambar tidak didukung.`);
        }
    }
};