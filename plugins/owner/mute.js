// belom di test

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../database/muted.json');

module.exports = {
    name: 'mute',
    category: 'owner',
    description: 'Membuat bot tidak merespon di grup ini.',
    owner: true,
    run: async (sock, m, args) => {
        if (!m.key.remoteJid.endsWith('@g.us')) return m.reply('Perintah ini hanya untuk grup.');
        try {
            const muted = JSON.parse(fs.readFileSync(dbPath));
            if (muted.includes(m.key.remoteJid)) return m.reply('Grup ini sudah di-mute.');

            muted.push(m.key.remoteJid);
            fs.writeFileSync(dbPath, JSON.stringify(muted, null, 2));
            m.reply('Bot berhasil di-mute di grup ini.');
        } catch (e) {
            m.reply(`Error: ${e.message}`);
        }
    }
};