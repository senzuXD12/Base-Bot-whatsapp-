// belom di test

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../database/muted.json');

module.exports = {
    name: 'unmute',
    category: 'owner',
    description: 'Membuat bot merespon kembali di grup ini.',
    owner: true,
    run: async (sock, m, args) => {
        if (!m.key.remoteJid.endsWith('@g.us')) return m.reply('Perintah ini hanya untuk grup.');
        try {
            let muted = JSON.parse(fs.readFileSync(dbPath));
            if (!muted.includes(m.key.remoteJid)) return m.reply('Grup ini tidak di-mute.');

            muted = muted.filter(group => group !== m.key.remoteJid);
            fs.writeFileSync(dbPath, JSON.stringify(muted, null, 2));
            m.reply('Bot berhasil di-unmute di grup ini.');
        } catch (e) {
            m.reply(`Error: ${e.message}`);
        }
    }
};