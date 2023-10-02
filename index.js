const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let lastPostedKey = 0; // Initialize with default value


client.once('ready', async () => {
    console.log('Bot is ready!');
    await fetchAndPost();

    client.destroy(); // End the client session after the task is done
});

client.login(BOT_TOKEN);

async function fetchAndPost() {
    try {
        let { data: tasks, error } = await supabase
            .from('Tasks')
            .select('*')
            .limit(1)
            .gt('Key', lastPostedKey);

        if (error) {
            console.error('Error fetching data:', error.message);
            return;
        }

        if (tasks.length === 0) {
            console.log('No new tasks retrieved from Supabase.');
            return;
        }

        const task = tasks[0];
        lastPostedKey = task.Key;

        const channel = client.channels.cache.find(ch => ch.name === 'test');

        if (channel && task) {
            const messageContent = `
                Task Name: ${task['Task Name']}
                Activity Type: ${task['Activity Type']}
                Description: ${task.Description}
                Submission Type: ${task['Submission Type']}
            `;

            channel.send(messageContent);
        } else {
            console.log('Channel not found or task is empty.');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}