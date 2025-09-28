const si = require("systeminformation");
const prettyMs = require("pretty-ms");

module.exports = {
    name: 'ping',
    category: 'main',
    description: 'Mengukur kecepatan respons bot.',
    register: true,
    run: async (sock, m, args) => {
        try {
            const start = Date.now();

            const sent = await sock.sendMessage(m.key.remoteJid, { text: "🏓 Ping..." }, { quoted: m });
            const ping = Date.now() - start;

            await sock.sendMessage(m.key.remoteJid, { delete: sent.key });

            const mem = await si.mem();
            const disk = await si.fsSize();
            const cpu = await si.cpu();
            const os = await si.osInfo();

            const ramUsed = (mem.active / 1024 / 1024 / 1024).toFixed(2);
            const ramTotal = (mem.total / 1024 / 1024 / 1024).toFixed(2);

            const diskUsed = (disk[0].used / 1024 / 1024 / 1024).toFixed(2);
            const diskTotal = (disk[0].size / 1024 / 1024 / 1024).toFixed(2);

            const uptime = prettyMs(process.uptime() * 1000, { verbose: true });

            const caption = `
🏓 *PONG!*
───────────────
📡 *Ping:* ${ping} ms
🖥 *OS:* ${os.distro} (${os.platform})
⚙️ *CPU:* ${cpu.manufacturer} ${cpu.brand} (${cpu.cores} cores)
⏳ *Runtime:* ${uptime}
📶 *RAM:* ${ramUsed} GB / ${ramTotal} GB
💾 *Disk:* ${diskUsed} GB / ${diskTotal} GB
───────────────
            `.trim();

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: caption,
                    contextInfo: {
                        externalAdReply: {
                            title: "📊 System Status",
                            body: "Bot performance monitor",
                            thumbnailUrl: "https://files.catbox.moe/dumadq.jpeg",
                            sourceUrl: "https://github.com/fosslix",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: m }
            );
        } catch (e) {
            console.error("Ping command error:", e);
            await m.reply("❌ Gagal ambil data sistem.");
        }
    }
};