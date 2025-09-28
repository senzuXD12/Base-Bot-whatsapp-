// belom di test

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/maintenance.json');

module.exports = {
    name: 'scupd',
    category: 'owner',
    description: 'Mengaktifkan atau menonaktifkan mode maintenance.',
    owner: true,
    run: async (sock, m, args) => {
        try {
            let maintenance = JSON.parse(fs.readFileSync(dbPath));
            
            maintenance.is_active = !maintenance.is_active; 
            maintenance.notified_users = []; 

            fs.writeFileSync(dbPath, JSON.stringify(maintenance, null, 2));

            const status = maintenance.is_active ? 'AKTIF' : 'NONAKTIF';
            m.reply(`✅ Mode maintenance sekarang *${status}*.`);

        } catch (error) {
            console.error('Error pada fitur scupd:', error);
            m.reply('Gagal mengubah mode maintenance.');
        }
    }
};