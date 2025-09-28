const axios = require('axios');

module.exports = {
    name: 'tcosplay',
    category: 'nsfw',
    description: 'Cari galeri cosplay dari CosplayTele.',
    hidden: true,
    register: true,
    premium: true,
    pass: 'Bertaubat4RtyU87',
    auth: true,
    run: async (sock, m, args) => {
        const query = args.join(' ');
        if (!query) return m.reply(`⚠️ Masukkan kata kunci!\n\nContoh: *.tcosplay Furina*`);

        try {
            console.log(`🔍 Searching cosplay dengan query: "${query}"`);
            const res = await axios.get(
                `https://api.nekolabs.my.id/discovery/cosplaytele/search?q=${encodeURIComponent(query)}`
            );
            const results = res.data.result;

            if (!res.data.status || results.length === 0) {
                console.log("❌ Tidak ada hasil dari search API");
                return m.reply(`❌ Tidak ada hasil untuk *"${query}"*.`);
            }

            console.log(`✅ Search berhasil, ditemukan ${results.length} hasil`);

            const sections = [{
                title: "📂 Hasil Pencarian",
                rows: results.slice(0, 20).map(item => ({
                    title: item.title,
                    description: item.excerpt ? item.excerpt.slice(0, 80) + '...' : 'Tanpa deskripsi',
                    rowId: `.tcosplayd ${item.url}`
                }))
            }];

            const listMessage = {
                text: `🔎 Hasil pencarian untuk *"${query}"*. Pilih salah satu:`,
                footer: "🔒 Premium access",
                title: "Daftar Galeri Cosplay",
                buttonText: "📂 Lihat Hasil",
                sections
            };

            const sent = await sock.sendMessage(m.key.remoteJid, listMessage, { quoted: m });

            sock.ev.on('messages.upsert', async ({ messages }) => {
                const msg = messages[0];
                if (msg.message?.listResponseMessage &&
                    msg.message.listResponseMessage.contextInfo?.stanzaId === sent.key.id) {
                    await sock.sendMessage(m.key.remoteJid, { delete: sent.key });
                }
            });

        } catch (e) {
            console.error('❌ Cosplay Search Error:', e);
            m.reply(`❌ Terjadi kesalahan: ${e.message}`);
        }
    }
};