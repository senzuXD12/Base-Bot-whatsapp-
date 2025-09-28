const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '../../database/autoai.json');
const readDb = () => JSON.parse(fs.readFileSync(dbPath));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

module.exports = {
    name: 'autoai',
    category: 'main',
    description: 'Mengelola fitur Auto AI di chat.',
    register: true,
    run: async (sock, m, args) => {
        const subCommand = args[0]?.toLowerCase();
        const jid = m.key.remoteJid;

        try {
            let sessions = readDb();
            let session = sessions.find(s => s.jid === jid);

            switch (subCommand) {
                case 'csesi':
                    if (session) {
                        return m.reply(`Anda sudah memiliki sesi AI di chat ini dengan ID: *${session.sessionId}*.\nGunakan *.autoai resetsesi* untuk membuat yang baru.`);
                    }
                    const newSessionId = crypto.randomBytes(8).toString('hex');
                    sessions.push({
                        jid: jid,
                        sessionId: newSessionId,
                        createdAt: new Date().toISOString(),
                        isActive: false 
                    });
                    writeDb(sessions);
                    return m.reply(`✅ Sesi AI baru berhasil dibuat!\n\n*Session ID:* ${newSessionId}\n\nKetik *.autoai on* untuk mulai menggunakan.`);

                case 'on':
                case 'off':
                    if (!session) {
                        return m.reply('Tidak ada sesi AI yang ditemukan. Buat sesi baru dengan *.autoai csesi*');
                    }
                    const newStatus = subCommand === 'on';
                    if (session.isActive === newStatus) {
                        return m.reply(`Mode Auto AI sudah dalam keadaan *${newStatus ? 'ON' : 'OFF'}*.`);
                    }
                    session.isActive = newStatus;
                    writeDb(sessions);
                    return m.reply(`✅ Mode Auto AI sekarang *${newStatus ? 'ON' : 'OFF'}*.`);

                case 'status':
                    if (!session) {
                        return m.reply('Fitur Auto AI belum diatur di chat ini.\nKetik *.autoai csesi* untuk membuat sesi baru.');
                    }
                    const statusText = `*Status Auto AI*\n\n*• Status:* ${session.isActive ? 'ON' : 'OFF'}\n*• Session ID:* ${session.sessionId}\n*• Dibuat pada:* ${new Date(session.createdAt).toLocaleString('id-ID')}`;
                    return m.reply(statusText);

                case 'resetsesi':
                    if (!session) {
                        return m.reply('Tidak ada sesi yang bisa di-reset. Buat sesi baru dengan *.autoai csesi*');
                    }
                    const buttons = [
                        { buttonId: 'autoai_confirm_reset', buttonText: { displayText: 'Ya, Reset Sesi' }, type: 1 },
                        { buttonId: 'autoai_cancel_reset', buttonText: { displayText: 'Batal' }, type: 1 }
                    ];
                    const buttonMessage = {
                        text: "❓ Anda yakin ingin me-reset sesi AI?\n\nSemua riwayat percakapan dengan AI di sesi ini akan dihapus.",
                        footer: 'Tindakan ini tidak dapat dibatalkan.',
                        buttons: buttons,
                        headerType: 1
                    };
                    return await sock.sendMessage(jid, buttonMessage, { ai: true });

                default:
                    const helpText = `*Perintah Auto AI*\n\n*• .autoai csesi*\n_Membuat sesi percakapan baru dengan AI._\n\n*• .autoai on/off*\n_Mengaktifkan atau menonaktifkan balasan otomatis AI._\n\n*• .autoai status*\n_Melihat status sesi AI saat ini._\n\n*• .autoai resetsesi*\n_Menghapus sesi lama dan membuat yang baru._`;
                    return m.reply(helpText);
            }
        } catch (error) {
            console.error('Error pada fitur Auto AI:', error);
            m.reply('Terjadi kesalahan pada fitur Auto AI.');
        }
    }
};