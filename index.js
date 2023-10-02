const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { persistSession: false });

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
            .from('Task')
            .select('*')
            .limit(4)
            .gt('Key', lastPostedKey);

        if (error) {
            console.error('Error fetching data:', error.message);
            return;
        }

        if (tasks.length === 0) {
            console.log('No new tasks retrieved from Supabase.');
            return;
        }

        const channel = client.channels.cache.find(ch => ch.name === 'bot-test');
        if (!channel) {
            console.log('Channel not found.');
            return;
        }

        for (const task of tasks) {
            console.log(`Processing task with Key: ${task.Key}`);
            lastPostedKey = task.Key;

            const embed = new EmbedBuilder();
            embed.setTitle(`**${task['Title']}**`);
            embed.addFields(
                { name: `**📌 Activity Type**`, value: `*${task['Category']}*` },
                { name: `**📝 Description**`, value: `*${task['Short Description']}*` },
                { name: `**🔗 Submission Type**`, value: `*${task['Submission Type']}*` }
            );

            if (task['More Information']) {
                embed.addFields({ name: '**Additional Information**', value: `*${task['More Information']}*` });
            }

            if (task['Image']) {
                embed.setThumbnail(task['Image']);
            }

            channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
