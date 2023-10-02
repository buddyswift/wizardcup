const { Client, GatewayIntentBits } = require('discord.js');
const xlsx = require('xlsx');
require('dotenv').config({ path: 'C:/Users/Tom/Documents/WizardCup/.env' });

const BOT_TOKEN = process.env.BOT_TOKEN;
const EXCEL_FILE_PATH = 'C:/Users/Tom/Documents/WizardCup/sorting.xlsx';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

let lastPostedRow = 7; // Initialized to 1 to start from the second row (e2 and f2)

client.once('ready', () => {
    console.log('Bot is ready!');

    // This interval will run every 5 seconds
    setInterval(async () => {
        try {
            const workbook = xlsx.readFile(EXCEL_FILE_PATH);
            const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
            const sheet = workbook.Sheets[sheetName];

            const message = sheet['E' + (lastPostedRow + 1)] ? sheet['E' + (lastPostedRow + 1)].v : null;
            const attachmentURL = sheet['F' + (lastPostedRow + 1)] ? sheet['F' + (lastPostedRow + 1)].v : null;

            if (!message) {
                console.log('No new messages retrieved from Excel.');
                return;
            }

            lastPostedRow++; // Update the last posted row

            const channel = client.channels.cache.find(ch => ch.name === 'great-hall'); // Replace 'test' with your channel name.

            if (channel && message && attachmentURL) {
                const messageOptions = {
                    content: message,
                    files: [attachmentURL]
                };

                channel.send(messageOptions);
            } else {
                console.log('Channel not found, message is empty, or attachment URL is missing.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    }, 8000);
});

client.on('error', error => {
    console.error('There was an error with the client:', error);
});

client.login(BOT_TOKEN);
