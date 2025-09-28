// belom di test

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../database/banned.json');

module.exports = {
    name: 'ban',
    category: 'owner',
    description: 'Mem-ban pengguna.',
    owner: true,
    run: async (sock, m, args) => {
        try {
            let target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            if (!target || !target.endsWith('@s.whatsapp.net')) return m.reply('Sebutkan target atau reply pesannya.');

            const banned = JSON.parse(fs.readFileSync(dbPath));
            if (banned.includes(target)) return m.reply('Pengguna ini sudah di-ban.');

            banned.push(target);
            fs.writeFileSync(dbPath, JSON.stringify(banned, null, 2));
            m.reply(`Berhasil mem-ban ${target.split('@')[0]}.`);
        } catch (e) {
            m.reply(`Error: ${e.message}`);
        }
    }
};