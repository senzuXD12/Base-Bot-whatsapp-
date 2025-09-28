const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

module.exports = {
    name: "bksc",
    category: "owner",
    description: "Backup semua file bot kecuali media, node_modules, session, package-lock.json",
    owner: true,

    run: async (sock, m, args, { isOwner }) => {
        try {
            if (!isOwner) return m.reply("❌ Hanya owner yang bisa pakai perintah ini!");

            const backupFile = path.resolve(`./backup-${Date.now()}.zip`);
            const output = fs.createWriteStream(backupFile);
            const archive = archiver("zip", { zlib: { level: 9 } });

            output.on("close", async () => {
                try {
                    await sock.sendMessage(m.key.remoteJid, {
                        document: fs.readFileSync(backupFile),
                        fileName: path.basename(backupFile),
                        mimetype: "application/zip"
                    });

                    await m.reply(
                        `✅ Backup selesai.\nUkuran: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB\nFile akan dihapus otomatis dalam 3 jam.`
                    );

                    setTimeout(() => {
                        if (fs.existsSync(backupFile)) {
                            fs.unlinkSync(backupFile);
                            console.log("🗑️ Backup otomatis dihapus:", backupFile);
                        }
                    }, 3 * 60 * 60 * 1000);
                } catch (err) {
                    console.error("❌ Error kirim file:", err);
                    await m.reply("Gagal mengirim file backup: " + err.message);
                }
            });

            archive.on("error", (err) => {
                throw err;
            });

            archive.pipe(output);

            const exclude = ["node_modules", "session", "package-lock.json"];

            fs.readdirSync(path.resolve("./")).forEach((file) => {
                if (!exclude.includes(file)) {
                    const fullPath = path.resolve("./", file);
                    if (fs.lstatSync(fullPath).isDirectory()) {
                        archive.directory(fullPath, file);
                    } else {
                        archive.file(fullPath, { name: file });
                    }
                }
            });

            await archive.finalize();
        } catch (e) {
            console.error("Error bksc:", e);
            await m.reply("❌ Gagal membuat backup: " + e.message);
        }
    }
};