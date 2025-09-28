const chalk = require('chalk');
const fs = require('fs');

global.settings = {
    botName: "Foss Line", // NAMA BOT
    botVersion: "0.01-beta", // VERSI BOT
    ownerName: "Fosslix", // NAMA OWNER
    ownerNumbers: ["6285XXXX"], // NOMOR OWNER
    prefix: '.', // PREFIX
    customPairingCode: "FOSSLNXI", // CUSTOM PAIRING
    
    welcome: true, 
    goodbye: true,

    welcomeBackgroundUrl: "https://i.ibb.co/4YBNyvP/images-76.jpg",
    goodbyeBackgroundUrl: "https://i.ibb.co/4YBNyvP/images-76.jpg",
    menuThumbnailUrl: "https://files.catbox.moe/24anvd.jpeg",

    
    welcomeText: "Halo @user, selamat datang di grup @subject! Semoga betah ya.",
    goodbyeText: "Selamat tinggal @user dari grup @subject...",

    aiPromptPublic: "kamu adalah zena,kamu sangat ceria dan ekspresif.", // PROMPT UNTUK OWNER
    aiPromptOwner: "kamu adalah zena,kamu ceria tapi sedikit cuek." // PROMPT UNTUK NON OWNER/USER
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update'${__filename}'`));
    delete require.cache[file];
    require(file);
});