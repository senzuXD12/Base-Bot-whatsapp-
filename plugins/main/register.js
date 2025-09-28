// terkadang err,dan err di grup

const fs = require('fs');
const path = require('path');
const { getSender } = require('../../lib/functions'); 

const dbPath = path.join(__dirname, '../../database/user.json');

module.exports = {
    name: 'register',
    category: 'main',
    description: 'Mendaftarkan atau menautkan akun pengguna.',
    register: false,
    run: async (sock, m, args) => {
        try {
            const sender = getSender(m); 
            let users = JSON.parse(fs.readFileSync(dbPath));

            if (users.some(user => user.id === sender || (user.lid && user.lid === sender))) {
                return m.reply('Akun Anda sudah terdaftar/tertaut dengan ID ini!');
            }
            
            const isGroup = m.key.remoteJid.endsWith('@g.us');

            if (isGroup && args.length === 0) {
                const userByName = users.find(user => user.name === m.pushName && !user.lid);
                if (userByName) {
                    userByName.lid = sender; 
                    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
                    return m.reply(`✅ Akun *${userByName.name}* berhasil ditautkan untuk grup ini!`);
                } else {
                    return m.reply('Akun dengan nama profil Anda tidak ditemukan. Silakan daftar dulu di private chat dengan format:\n*.register nama,umur*');
                }
            }
            
            const input = args.join(' ');
            if (!input.includes(',')) {
                return m.reply(`Format salah.\nGunakan: .register nama,umur\nContoh: .register Budi,17`);
            }
            
            const [name, age] = input.split(',').map(s => s.trim());
            if (!name || !age || isNaN(age)) {
                return m.reply(`Format salah.\nContoh: .register Budi,17`);
            }

            users.push({ id: sender, name, age: parseInt(age), lid: null, registeredAt: new Date().toISOString() });
            fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
            m.reply(`✅ Registrasi berhasil!\n\nNama: ${name}\nUmur: ${age}\n\nUntuk menggunakan bot di grup, silakan masuk ke grup dan ketik *.register* untuk menautkan akun Anda.`);

        } catch (error) {
            console.error(error);
            m.reply(`Terjadi error: ${error.message}`);
        }
    }
};