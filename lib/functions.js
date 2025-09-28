const { jidNormalizedUser } = require('@fadzzzslebew/baileys');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Mengambil ID pengirim yang sudah dinormalisasi dari objek pesan.
 * @param {object} m Objek pesan dari Baileys
 * @returns {string} JID pengguna yang sudah bersih dan konsisten.
 */
function getSender(m) {
    const isGroup = m.key.remoteJid.endsWith('@g.us');
    const rawJid = isGroup ? m.key.participant : m.key.remoteJid;
    return jidNormalizedUser(rawJid);
}

async function uploadImage(buffer) {
    const form = new FormData();
    form.append('files[]', buffer, 'image.jpg');
    try {
        const { data } = await axios.post('https://uguu.se/upload.php', form, { headers: { ...form.getHeaders() } });
        return data.files[0].url;
    } catch (error) {
        console.error("Gagal upload ke uguu:", error.response ? error.response.data : error.message);
        throw new Error("Gagal upload gambar.");
    }
}

module.exports = { getSender, uploadImage };