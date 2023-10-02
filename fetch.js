const { Client, GatewayIntentBits } = require('discord.js');
const xlsx = require('xlsx');
require('dotenv').config({ path: 'C:/Users/Tom/Documents/WizardCup/.env' });

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = '853754108501426217'; // Replace with your guild (server) ID

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', async () => {
    console.log('Bot is ready!');
    
    // Fetch the guild by its ID
    const guild = client.guilds.cache.get(GUILD_ID);
    
    if (!guild) {
        console.error('Guild not found.');
        return;
    }
    
    try {
        // Fetch all members of the guild
        await guild.members.fetch();
        
        // Create a new workbook and add a worksheet
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.aoa_to_sheet([['User ID', 'Username', 'Nickname']]); // Create a header row
        
        // Loop through the guild's members and add their IDs, usernames, and nicknames to the worksheet
        guild.members.cache.forEach(member => {
            const userId = member.user.id;
            const username = member.user.username;
            const nickname = member.nickname || ''; // Use an empty string if no nickname is set
            xlsx.utils.sheet_add_aoa(worksheet, [[userId, username, nickname]], { origin: -1 }); // Append rows
        });
        
        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, 'User Data');
        
        // Save the workbook to a file
        xlsx.writeFile(workbook, 'user_data2.xlsx');
        
        console.log('User data saved to user_data2.xlsx');
    } catch (error) {
        console.error('An error occurred:', error);
    }
});

client.on('error', error => {
    console.error('There was an error with the client:', error);
});

client.login(BOT_TOKEN);
