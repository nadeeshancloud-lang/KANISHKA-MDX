const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const mongoose = require('mongoose');
const config = require('./settings');

async function startKanishkaMDX() {
    // Database Connection
    /*
    mongoose.connect(config.DATABASE_URL).then(() => {
        console.log('Database Connected Successfully!');
    }).catch(err => console.log('Database connection error:', err));
    */

    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            console.log('Connection closed, reconnecting...');
            startKanishkaMDX();
        } else if(connection === 'open') {
            console.log(config.BOT_NAME + ' Connected Successfully! 🚀');
        }
    });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if(!msg.message || msg.key.fromMe) return;
        
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const remoteJid = msg.key.remoteJid;

        // Simple Ping Command
        if (text === config.PREFIX + 'ping') {
            await sock.sendMessage(remoteJid, { text: '🔥 ' + config.BOT_NAME + ' is Online & Super Fast! 🔥' });
        }
    });
}

startKanishkaMDX();
