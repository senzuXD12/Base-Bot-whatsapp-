const fs = require('fs');
const path = require('path');
const { jidNormalizedUser } = require('@fadzzzslebew/baileys');

const dbPath = path.join(__dirname, '../../database/premium.json');

function parseDuration(str) {
    const amount = parseInt(str.slice(0, -1));
    const unit = str.slice(-1).toLowerCase();
    if (isNaN(amount)) return null;
    switch (unit) {
        case 'h': return amount * 60 * 60 * 1000;
        case 'd': return amount * 24 * 60 * 60 * 1000;
        case 'b': return amount * 30 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    name: 'addprem',
    category: 'owner',
    description: 'Menambahkan pengguna ke daftar premium.',
    owner: true,
    run: async (sock, m, args) => {
        try {
            const targetArg = args[0];
            const durationArg = args[1];

            if (!targetArg || !durationArg) {
                return m.reply('Format salah.\nGunakan: *.addprem [nomor] [durasi]*\nContoh: *.addprem 62812... 5d (h:jam,d:hari,b:bulan)*');
            }
           
            const targetId = targetArg.replace(/[^0-9]/g, '');
            const targetJid = jidNormalizedUser(targetId + '@s.whatsapp.net');
            const durationMs = parseDuration(durationArg);

            if (!durationMs) {
                return m.reply('Format durasi salah. Gunakan h (jam), d (hari), atau b (bulan).');
            }

            const expires = Date.now() + durationMs;
            const expiryDate = new Date(expires).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

            let premiumUsers = JSON.parse(fs.readFileSync(dbPath));
            const userIndex = premiumUsers.findIndex(u => u.id === targetId);

            if (userIndex !== -1) {
                premiumUsers[userIndex].expires = expires;
            } else {
                premiumUsers.push({ id: targetId, expires: expires });
            }

            fs.writeFileSync(dbPath, JSON.stringify(premiumUsers, null, 2));

            m.reply(`✅ Berhasil menambahkan/memperpanjang premium untuk ${targetId} hingga ${expiryDate}.`);
            await sock.sendMessage(targetJid, {
                text: `Selamat! Anda telah dijadikan pengguna Premium.\nMasa berlaku Anda hingga: *${expiryDate}*`
            }, { ai: true });

        } catch (error) {
            console.error('Error pada fitur addprem:', error);
            m.reply(`Gagal menambahkan premium: ${error.message}`);
        }
    }
};