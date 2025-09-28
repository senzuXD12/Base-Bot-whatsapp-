const axios = require('axios');
const { delay } = require('@fadzzzslebew/baileys');

module.exports = {
    name: 'tcosplayd',
    category: 'nsfw',
    description: 'Ambil galeri cosplay dari link CosplayTele.',
    hidden: true,
    register: true,
    premium: true,
    run: async (sock, m, args) => {
        const url = args[0];
        if (!url) return m.reply("⚠️ Masukkan link cosplay dari *.tcosplay*");

        try {
            const apiUrl = `https://api.nekolabs.my.id/discovery/cosplaytele/detail?url=${encodeURIComponent(url)}`;
            console.log("🌐 Fetching detail dari:", apiUrl);

            const response = await axios.get(apiUrl);
            const result = response.data.result;

            if (!response.data.status || (!result.images && !result.videos)) {
                console.log("❌ Tidak ada media di detail API");
                return m.reply("❌ Tidak ada media ditemukan pada link ini.");
            }

            console.log("✅ API Detail CosplayTele:", result);

            const imageCount = result.images ? result.images.length : 0;
            const videoCount = result.videos ? result.videos.length : 0;

            const infoMsg = await sock.sendMessage(m.key.remoteJid, {
                text: `✅ *Galeri ditemukan!*\n\n*Judul:* ${result.title}\n*Foto:* ${imageCount}\n*Video:* ${videoCount}`
            }, { quoted: m });

            const sentMsgs = [];

            if (result.images) {
                for (const img of result.images.slice(0, 10)) {
                    try {
                        const res = await axios.get(img, { responseType: "arraybuffer" });
                        const buffer = Buffer.from(res.data, "binary");

                        const sent = await sock.sendMessage(
                            m.key.remoteJid,
                            {
                                image: buffer,
                                mimetype: "image/jpeg",
                                fileName: "cosplay.jpg"
                            },
                            { quoted: infoMsg }
                        );

                        sentMsgs.push(sent);
                        await delay(1500);
                    } catch (err) {
                        console.error("⚠️ Gagal download foto:", err.message);
                    }
                }
            }

            if (result.videos) {
                for (const vid of result.videos.slice(0, 5)) {
                    try {
                        const sent = await sock.sendMessage(
                            m.key.remoteJid,
                            {
                                video: { url: vid },
                                mimetype: "video/mp4",
                                caption: "🎥 Video cosplay"
                            },
                            { quoted: infoMsg }
                        );

                        sentMsgs.push(sent);
                        await delay(2000);
                    } catch (err) {
                        console.error("⚠️ Gagal download video:", err.message);
                    }
                }
            }

            if (m.message?.listResponseMessage) {
                await sock.sendMessage(m.key.remoteJid, { delete: m.key });
            }

            // semua media dihapus kalo udah 15dtk
            setTimeout(async () => {
                try {
                    for (const sent of sentMsgs) {
                        if (sent?.key?.id) {
                            await sock.sendMessage(m.key.remoteJid, {
                                delete: {
                                    id: sent.key.id,
                                    remoteJid: m.key.remoteJid,
                                    fromMe: true
                                }
                            });
                            await delay(500); 
                        }
                    }

                    if (infoMsg?.key?.id) {
                        await sock.sendMessage(m.key.remoteJid, {
                            delete: {
                                id: infoMsg.key.id,
                                remoteJid: m.key.remoteJid,
                                fromMe: true
                            }
                        });
                    }

                    console.log("🧹 Semua media & infoMsg sudah dihapus.");
                    
                } catch (err) {
                    console.error("❌ Gagal menghapus media:", err);
                }
            }, 15000);

        } catch (e) {
            console.error('❌ Cosplay Fetch Error:', e);
            await m.reply(`❌ Error: ${e.message}`);
        }
    }
};