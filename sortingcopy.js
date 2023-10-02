const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config({ path: 'C:/Users/Tom/Documents/WizardCup/.env' });
const BOT_TOKEN = process.env.BOT_TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log('Bot is ready!');

    // This interval will run every 5 seconds
    setInterval(async () => {
        try {
            const channel = client.channels.cache.find(ch => ch.name === 'test'); // Change 'test' to your channel name

            await channel.send({
                content: 'This is a test message',
                embeds: [{
                    title: 'Test Embed',
                    description: 'This is a description for the embed',
                    image: {
                        url: 'https://tenor.com/en-GB/view/harry-potter-ravenclaw-flames-logo-seal-gif-5254360'
                    }
                }]
            });

        } catch (error) {
            console.error("Error occurred while sending message:", error);
        }
    }, 2000);  // 5000 milliseconds = 5 seconds
});

client.on('error', error => {
    console.error('There was an error with the client:', error);
});

client.login(BOT_TOKEN);
