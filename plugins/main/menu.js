// terkadang gif (gifPlayback) tifak work,fix sendiri kalo mao

const fs = require("fs");
const axios = require("axios");

function wish() {
    let time = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    let hours = time.getHours();
    const messages = {
        0: ['🌙 Tengah malam banget, waktunya tidur, ya!'], 1: ['🛌 Udah jam 1 lebih, ayo tidur yuk.'],
        2: ['💤 Masih begadang jam 2? Jaga kesehatan, ya!'], 3: ['🛌 Udah jam 3 dini hari, waktunya tidur.'],
        4: ['☀️ Pagi buta nih! Semangat buat bangun!'], 5: ['🐓 Ayam berkokok, waktunya bangun pagi!'],
        6: ['🏃‍♂️ Pagi-pagi gini olahraga dulu yuk~'], 7: ['💻 Pagi produktif yuk!'],
        8: ['🍎 Cemilan pagi penting lho!'], 9: ['🌤️ Selamat siang! Yuk makan siang~'],
        10: ['📖 Siang gini enaknya baca buku.'], 11: ['🌇 Sore mulai mendekat, selesaikan aktivitasmu~'],
        12: ['🌤️ Udah masuk jam 12, siapin makan siang yuk~'], 13: ['📖 Abis makan, cocok buat baca buku santai.'],
        14: ['🥤 Waktunya ngemil atau minum yang seger-seger~'], 15: ['🌇 Udah sore! Jangan lupa stretching~'],
        16: ['📸 Coba deh foto-foto langit sore!'], 17: ['🌅 Menjelang malam nih, suasananya adem~'],
        18: ['🌙 Malam tiba, waktunya buat tenangin pikiran~'], 19: ['🎮 Lagi main game? Jangan lupa waktu, ya!'],
        20: ['📖 Malam gini cocok banget buat baca novel~'], 21: ['🌌 Udah malam nih, jangan begadang ya.'],
        22: ['🌌 Udah larut malam, mimpi indah ya!'], 23: ['💤 Udah tengah malam banget, waktunya tidur.']
    };
    const list = messages[hours] || ["🌸 Semoga harimu menyenangkan~"];
    return list[Math.floor(Math.random() * list.length)];
}

function formatRuntime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}h ${h}j ${m}m ${s}d`;
}

module.exports = {
    name: "menu",
    category: "main",
    description: "Menampilkan daftar menu bot",
    register: true,
    run: async (sock, m, args, { userFromDb, isOwner, isPremium }) => { 
        try {
            const from = m.key.remoteJid;
            const user = userFromDb || { name: "Pengguna", age: "??" };

            let userStatus = "👤 User";
            if (isOwner) userStatus = "👑 Owner";
            else if (isPremium) userStatus = "✨ Premium";

            const runtime = formatRuntime((Date.now() - global.botStartTime) / 1000);
            const ping = Date.now() - (m.messageTimestamp * 1000);
            const jam = new Date().toLocaleTimeString("id-ID", { timeZone: 'Asia/Jakarta' });
            const tanggal = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' });

            const categories = {};
            global.plugins.forEach(plugin => {
                if (plugin.hidden) return;
                if (!plugin.category || plugin.category.toLowerCase() === 'owner' && !isOwner) return;
                if (!categories[plugin.category]) categories[plugin.category] = [];
                categories[plugin.category].push(plugin);
            });

            const cmd = args[0]?.toLowerCase();
            let caption = `👋 Halo, *${user.name}*!\n${wish()}\n\n`;
            let videoUrl = "https://cdnaset.vercel.app/menu1.mp4";

            if (cmd === "all") {
                videoUrl = "https://cdnaset.vercel.app/menu3.mp4";
                caption += `✦───────────────────✦\n     🌸 ${global.settings.botName} All Menu 🌸\n✦───────────────────✦\n🕒 Jam    : ${jam}\n📅 Tanggal : ${tanggal}\n👤 Kamu   : ${user.name}\n✦───────────────────✦\n`;
                for (const cat in categories) {
                    caption += `\n*${cat.toUpperCase()}*\n`;
                    categories[cat].forEach(p => {
                        caption += ` > ${global.settings.prefix}${p.name}${p.premium ? " ✨" : ""}\n`;
                    });
                }
            } else if (cmd && categories[cmd]) {
                videoUrl = "https://cdnaset.vercel.app/menu2.mp4";
                caption += `✦───────────────────✦\n    📂 ${global.settings.botName} Menu [${cmd.toUpperCase()}]\n✦───────────────────✦\n`;
                categories[cmd].forEach(p => {
                    caption += ` > ${global.settings.prefix}${p.name}${p.premium ? " ✨" : ""}\n`;
                });
            } else {
                caption += `✦───────────────────✦\n     🌙 ${global.settings.botName} Menu 🌙\n✦───────────────────✦\n🕒 Jam     : ${jam}\n📅 Tanggal : ${tanggal}\n🤖 Bot     : ${global.settings.botName}\n🔖 Versi   : v${global.settings.botVersion}\n👤 Kamu    : ${user.name}\n🌟 Status  : ${userStatus}\n⏳ Runtime : ${runtime}\n📶 Ping    : ${ping} ms\n✦───────────────────✦\n\n❀ Kategori tersedia ❀\n`;
                caption += ` > all\n`;
                for (const cat in categories) {
                    caption += ` > ${cat}\n`;
                }
                caption += `\nKetik: .menu <kategori>\nContoh: .menu downloader`;
            }

            const videoBuffer = (await axios.get(videoUrl, { responseType: 'arraybuffer' })).data;
            const thumbBuffer = (await axios.get(global.settings.menuThumbnailUrl, { responseType: 'arraybuffer' })).data;

            await sock.sendMessage(from, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                gifPlayback: true,
                contextInfo: {
                    externalAdReply: {
                        title: `${global.settings.botName} Dashboard`,
                        body: `Versi ${global.settings.botVersion} | Status: ${userStatus}`,
                        mediaType: 1,
                        thumbnail: thumbBuffer,
                        sourceUrl: "https://github.com/fosslix"
                    }
                },
                caption: caption
            }, { quoted: m, ai: true });

        } catch (err) {
            console.error("Gagal kirim menu:", err);
            m.reply("Terjadi kesalahan saat menampilkan menu.");
        }
    }
};