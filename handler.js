const chalk = require('chalk');
const { jidNormalizedUser, downloadMediaMessage } = require('@fadzzzslebew/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const { getSender, uploadImage } = require('./lib/functions');

const readJSON = (filePath) => JSON.parse(fs.readFileSync(path.join(__dirname, filePath)));
const writeJSON = (filePath, data) => fs.writeFileSync(path.join(__dirname, filePath), JSON.stringify(data, null, 2));

global.passwordPrompts = new Map();

module.exports = async (sock, m) => {
    try {
        let dbUser = readJSON('database/user.json');
        const dbAutoAi = readJSON('database/autoai.json');
        const maintenance = readJSON('database/maintenance.json');
        const dbPremium = readJSON('database/premium.json');
        let dbAuth = readJSON('database/auth_requests.json');

        const { message, key } = m;
        const from = key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        const sender = getSender(m);
        
        let userFromDb = dbUser.find(user => user.id === sender || (user.lid && user.lid === sender));
        if (!userFromDb && isGroup && m.pushName) {
            let potentialUser = dbUser.find(user => user.name === m.pushName && !user.lid);
            if (potentialUser) {
                potentialUser.lid = sender;
                writeJSON('database/user.json', dbUser);
                userFromDb = potentialUser;
            }
        }

        const pushName = userFromDb?.name || m.pushName || 'Tanpa Nama';
        const isImage = !!message?.imageMessage;
        const listResponse = message?.listResponseMessage;
        const buttonId = message?.buttonsResponseMessage?.selectedButtonId;
        
        let text = message?.conversation || message?.extendedTextMessage?.text || '';
        if (listResponse) { text = listResponse.singleSelectReply.selectedRowId; }

        m.reply = (replyText, options = {}) => sock.sendMessage(from, { text: replyText }, { quoted: m, ai: true, ...options });
        
        const logTime = new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
        console.log(`[${isGroup ? chalk.magenta('GRUP') : chalk.cyan('PRIVAT')}] [${chalk.yellow(logTime)}] ${chalk.green(pushName)} (${sender.split('@')[0]}): "${text || (isImage ? '[IMAGE]' : '[INTERACTION]')}"`);

        const realUserId = userFromDb ? userFromDb.id : sender;
        const isOwner = global.settings.ownerNumbers.some(num => realUserId.startsWith(num));
        const isPremium = dbPremium.some(user => user.id === realUserId && user.expires > Date.now());

        if (global.passwordPrompts.has(sender) && !text.startsWith(global.settings.prefix)) {
            const prompt = global.passwordPrompts.get(sender);
            const command = global.plugins.get(prompt.commandName);
            global.passwordPrompts.delete(sender);
            
            if (command && text.trim() === command.pass) {
                await m.reply('✅ Password benar.');
                if (command.auth) {
                    const requestId = crypto.randomBytes(8).toString('hex');
                    const newRequest = {
                        requestId, requesterJid: sender, command: prompt.commandName, originalArgs: prompt.args,
                        originalMessageKey: prompt.originalMessage.key, originalMessage: prompt.originalMessage.message, createdAt: Date.now()
                    };
                    for (const ownerNum of global.settings.ownerNumbers) {
                        const ownerJid = `${ownerNum}@s.whatsapp.net`;
                        const ownerMessage = `*-- Permintaan Otorisasi --*\n\n*• Pengguna:* ${pushName} (${sender.split('@')[0]})\n*• Perintah:* ${global.settings.prefix}${prompt.commandName}\n\nBalas (Reply) pesan ini dengan "ya" atau "tidak".`;
                        const sentMsg = await sock.sendMessage(ownerJid, { text: ownerMessage }, { ai: true });
                        dbAuth.push({ ...newRequest, requestMessageId: sentMsg.key.id, ownerJid });
                    }
                    writeJSON('database/auth_requests.json', dbAuth);
                    return m.reply('⏳ Password diterima. Perintah ini sekarang memerlukan izin dari Owner. Permintaan telah dikirim.');
                } else {
                    return await command.run(sock, prompt.originalMessage, prompt.args, { userFromDb, isOwner, isPremium });
                }
            } else {
                return await m.reply('❌ Password salah. Permintaan dibatalkan.');
            }
        }

        if (text.startsWith('$')) {
            if (!isOwner) return;
            const evalPlugin = global.plugins.get('eval');
            if (evalPlugin) {
                const args = text.slice(1).trim().split(/ +/);
                await evalPlugin.run(sock, m, args);
            }
            return;
        }

        const quotedInfo = m.message.extendedTextMessage?.contextInfo;
        if (isOwner && quotedInfo && (text.toLowerCase() === 'ya' || text.toLowerCase() === 'tidak')) {
            const authRequest = dbAuth.find(req => req.requestMessageId === quotedInfo.stanzaId && req.ownerJid === from);
            if (authRequest) {
                const isApproved = text.toLowerCase() === 'ya';
                const command = global.plugins.get(authRequest.command);
                const message = isApproved ? `✅ Permintaan Anda untuk *${authRequest.command}* disetujui.` : `❌ Permintaan Anda untuk *${authRequest.command}* ditolak.`;
                await sock.sendMessage(authRequest.requesterJid, { text: message }, { ai: true });
                if (isApproved && command) {
                    await sock.sendMessage(authRequest.requesterJid, { text: `Menjalankan perintah *${authRequest.command}* untuk Anda...` }, { ai: true });
                    const fakeM = { ...m, key: authRequest.originalMessageKey, message: authRequest.originalMessage };
                    await command.run(sock, fakeM, authRequest.originalArgs);
                }
                dbAuth = dbAuth.filter(req => req.requestId !== authRequest.requestId);
                writeJSON('database/auth_requests.json', dbAuth);
                await m.reply(`Respon *${text.toUpperCase()}* telah dikirim.`);
                return;
            }
        }
        
        if (buttonId) {
            if (buttonId === 'autoai_confirm_reset') {
                let sessions = dbAutoAi;
                const sessionIndex = sessions.findIndex(s => s.jid === from);
                if (sessionIndex !== -1) {
                    const newSessionId = crypto.randomBytes(8).toString('hex');
                    sessions[sessionIndex] = { ...sessions[sessionIndex], sessionId: newSessionId, createdAt: new Date().toISOString() };
                    writeJSON('database/autoai.json', sessions);
                    return m.reply(`✅ Sesi lama berhasil dihapus.\nSesi baru telah dibuat dengan ID: *${newSessionId}*`);
                }
            } else if (buttonId === 'autoai_cancel_reset') {
                return m.reply('Baik, reset sesi dibatalkan.');
            }
        }
        
        if (listResponse && listResponse.title === "Daftar Galeri Cosplay") {
            const cosplayPlugin = global.plugins.get('cosplay');
            if (cosplayPlugin && userFromDb) {
                return await cosplayPlugin.run(sock, m, []); 
            }
        }

        if (maintenance.is_active && !isOwner) {
            if (!maintenance.notified_users.includes(sender)) {
                sock.sendMessage(from, { text: "Mohon maaf, bot sedang dalam mode update/maintenace..." }, { ai: true });
                maintenance.notified_users.push(sender);
                writeJSON('database/maintenance.json', maintenance);
            }
            return;
        }

        const autoAiSession = dbAutoAi.find(s => s.jid === from);
        if (autoAiSession && autoAiSession.isActive && !text.startsWith(global.settings.prefix) && !buttonId && !listResponse) {
            const prompt = isOwner ? global.settings.aiPromptOwner : global.settings.aiPromptPublic;
            const params = { systemPrompt: prompt, sessionId: autoAiSession.sessionId };
            try {
                if (isImage) {
                    const buffer = await downloadMediaMessage(m, 'buffer', {});
                    params.imageUrl = await uploadImage(buffer);
                    params.text = m.message?.imageMessage?.caption || 'Deskripsikan gambar ini.';
                } else {
                    params.text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
                }
                if (!params.text.trim() && !params.imageUrl) return;
                const apiResponse = await axios.get(`https://api.nekolabs.my.id/ai/gpt/5-nano`, { params });
                if (apiResponse.data.status && apiResponse.data.result) await m.reply(apiResponse.data.result);
            } catch (apiError) {
                console.error('API Error Auto AI:', apiError.response ? apiError.response.data : apiError.message);
                await m.reply('Maaf, AI sedang mengalami gangguan.');
            }
            return;
        }
        
        if (!text.startsWith(global.settings.prefix)) return;

        if (global.passwordPrompts.has(sender)) {
            global.passwordPrompts.delete(sender);
        }

        const args = text.slice(global.settings.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = global.plugins.get(commandName);
        if (!command) return;
        
        if (command.register && !userFromDb) {
            const registerText = `👋 Halo *${pushName}*!\n\nAnda belum terdaftar atau akun Anda belum tertaut.\n\n*Jika pengguna baru*, ketik:\n*${global.settings.prefix}register nama,umur*`;
            return m.reply(registerText);
        }
        
        if (command.pass && !isOwner) {
            global.passwordPrompts.set(sender, {
                commandName: commandName, args: args, originalMessage: m, timestamp: Date.now()
            });
            setTimeout(() => { if (global.passwordPrompts.has(sender)) { global.passwordPrompts.delete(sender); } }, 60000);
            return m.reply(`Fitur *${commandName}* ini memerlukan password. Silakan balas dengan password Anda:`);
        }
        
        if (command.auth && !isOwner) {
            const requestId = crypto.randomBytes(8).toString('hex');
            const newRequest = {
                requestId, requesterJid: sender, command: commandName, originalArgs: args,
                originalMessageKey: m.key, originalMessage: m.message, createdAt: Date.now()
            };
            for (const ownerNum of global.settings.ownerNumbers) {
                const ownerJid = `${ownerNum}@s.whatsapp.net`;
                const ownerMessage = `*-- Permintaan Otorisasi --*\n\n*• Pengguna:* ${pushName} (${sender.split('@')[0]})\n*• Perintah:* ${global.settings.prefix}${commandName}\n\nBalas (Reply) pesan ini dengan "ya" atau "tidak".`;
                const sentMsg = await sock.sendMessage(ownerJid, { text: ownerMessage }, { ai: true });
                dbAuth.push({ ...newRequest, requestMessageId: sentMsg.key.id, ownerJid });
            }
            writeJSON('database/auth_requests.json', dbAuth);
            return m.reply('⏳ Perintah ini memerlukan izin Owner. Permintaan telah dikirim.');
        }
        
        if (command.premium && !isPremium && !isOwner) {
            return m.reply('Maaf, fitur ini hanya untuk pengguna Premium.');
        }
        
        if (command.owner && !isOwner) return m.reply("Perintah ini hanya untuk Owner Bot.");
        
        await command.run(sock, m, args, { userFromDb, isOwner, isPremium });

    } catch (error) {
        console.error('Error di handler:', error);
        if (m.reply) m.reply(`Terjadi error pada server: ${error.message}`);
    }
};