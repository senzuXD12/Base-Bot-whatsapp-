const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@fadzzzslebew/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chokidar = require('chokidar'); 
const messageHandler = require('./handler');
require('./settings');

global.botStartTime = Date.now();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
global.plugins = new Map();

function setupDatabase() {
    const dbDir = path.join(__dirname, 'database');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
    const requiredFiles = ['user.json', 'autoai.json', 'maintenance.json', 'premium.json', 'auth_requests.json', 'ban.json', 'unmute.json'];
    requiredFiles.forEach(file => {
        const filePath = path.join(dbDir, file);
        if (!fs.existsSync(filePath)) {
            const initialData = file === 'maintenance.json' ? { is_active: false, notified_users: [] } : [];
            fs.writeFileSync(filePath, JSON.stringify(initialData));
        }
    });
}

function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');
    global.plugins.clear();
    const categories = fs.readdirSync(pluginsDir);

    for (const category of categories) {
        const categoryDir = path.join(pluginsDir, category);
        if (!fs.statSync(categoryDir).isDirectory()) continue;
        const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.js'));
        for (const file of files) {
            try {
                const pluginPath = path.join(categoryDir, file);
                delete require.cache[require.resolve(pluginPath)];
                const plugin = require(pluginPath);
                if (plugin.name) {
                    plugin.category = category; 
                    global.plugins.set(plugin.name, plugin);
                }
            } catch (error) {
                console.log(chalk.red(`[ERROR LOAD] Gagal memuat plugin '${file}': ${error.message}`));
            }
        }
    }
    console.log(chalk.blue('✅ Semua plugin berhasil dimuat ulang.'));
}

async function connectToWhatsApp() {
    setupDatabase();
    loadPlugins(); 
    
    const pluginsPath = path.join(__dirname, 'plugins');
    const watcher = chokidar.watch(pluginsPath, {
        persistent: true,
        ignoreInitial: true,
    });

    watcher
        .on('add', (filePath) => {
            console.log(chalk.greenBright(`[RELOAD] Plugin baru terdeteksi: ${path.basename(filePath)}. Memuat ulang semua plugin...`));
            loadPlugins();
        })
        .on('change', (filePath) => {
            console.log(chalk.yellowBright(`[RELOAD] Plugin diubah: ${path.basename(filePath)}. Memuat ulang semua plugin...`));
            loadPlugins();
        })
        .on('unlink', (filePath) => {
            console.log(chalk.redBright(`[RELOAD] Plugin dihapus: ${path.basename(filePath)}. Memuat ulang semua plugin...`));
            loadPlugins();
        });

    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version, printQRInTerminal: false, auth: state,
        logger: pino({ level: 'silent' }),
        getMessage: async (key) => ({ conversation: 'hello' })
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question(chalk.yellow('Masukkan nomor WhatsApp Anda (cth: 628xxxx): '));
        try {
            const code = await sock.requestPairingCode(phoneNumber, global.settings.customPairingCode);
            console.log(chalk.green(`\nKode Pairing Anda: ${code?.match(/.{1,4}/g)?.join('-') || code}`));
        } catch (error) {
            console.error(chalk.red('Gagal meminta kode pairing:'), error);
            rl.close(); return;
        }
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
            else console.log(chalk.red('Koneksi terputus permanen. Hapus folder "session" dan jalankan ulang.'));
        } else if (connection === 'open') {
            console.log(chalk.green.bold(`🚀 Bot [${global.settings.botName}] berhasil terhubung! 🚀`));
            rl.close();
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        await sock.readMessages([msg.key]);
        await messageHandler(sock, msg);
    });

    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        
        const isWelcome = action === 'add' && global.settings.welcome;
        const isGoodbye = action === 'remove' && global.settings.goodbye;
        if (!isWelcome && !isGoodbye) return;

        try {
            const metadata = await sock.groupMetadata(id);
            const dbUser = JSON.parse(fs.readFileSync(path.join(__dirname, 'database/user.json')));
            for (const participant of participants) {
                let pfpUrl;
                try { pfpUrl = await sock.profilePictureUrl(participant, 'image'); } 
                catch { pfpUrl = 'https://i.ibb.co/gdpz6zV/user.png'; }
                const userInDb = dbUser.find(user => user.id === participant);
                const username = userInDb?.name || participant.split("@")[0];
                const description = isWelcome ? `Selamat Datang di ${metadata.subject}` : `Telah Meninggalkan Grup`;
                const apiUrlTemplate = isWelcome ? `https://api.siputzx.my.id/api/canvas/welcomev4` : `https://api.siputzx.my.id/api/canvas/goodbyev4`;
                const backgroundUrl = isWelcome ? global.settings.welcomeBackgroundUrl : global.settings.goodbyeBackgroundUrl;
                const apiUrl = `${apiUrlTemplate}?avatar=${encodeURIComponent(pfpUrl)}&background=${encodeURIComponent(backgroundUrl)}&description=${encodeURIComponent(description)}&username=${encodeURIComponent(username)}`;
                const caption = isWelcome ? `Halo, @${participant.split("@")[0]}!` : `Sampai jumpa, @${participant.split("@")[0]}!`;
                await sock.sendMessage(id, { image: { url: apiUrl }, caption: caption, mentions: [participant] }, { ai: true });
            }
        } catch (error) {
            console.error(chalk.red('[ERROR API WELCOME/LEAVE]'), error);
        }
    });
}
connectToWhatsApp();