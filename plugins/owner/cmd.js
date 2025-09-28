const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

module.exports = {
    name: 'cmd',
    category: 'owner',
    description: 'Menjalankan perintah di terminal server via $.',
    owner: true, 
    hidden: true,
    run: async (sock, m, args) => {
        const command = args.join(' ');
        if (!command) return;

        try {
            const { stdout, stderr } = await execPromise(command, { cwd: './' });
            
            let output = (stdout || '') + (stderr || '');
            if (!output.trim()) {
                await sock.sendMessage(m.key.remoteJid, { text: '✅' }, { quoted: m });
            } else {
                await sock.sendMessage(m.key.remoteJid, { text: `\`\`\`\n${output.trim()}\n\`\`\`` }, { quoted: m });
            }
        } catch (error) {
            const errorOutput = error.stderr || error.stdout || error.message;
            await sock.sendMessage(m.key.remoteJid, { text: `\`\`\`\n${errorOutput.trim()}\n\`\`\`` }, { quoted: m });
        }
    }
};