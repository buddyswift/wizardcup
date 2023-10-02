const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { persistSession: false });

let lastPostedKey = 0; // Initialize with default value

client.once('ready', async () => {
    lastPostedKey = await getLastPostedKey();  // Get the last posted key from the database
    console.log(`Last posted key retrieved: ${lastPostedKey}`);

    console.log('Bot is ready!');
    await fetchAndPost();
    client.destroy(); // End the client session after the task is done
});

client.login(BOT_TOKEN);

async function getLastPostedKey() {
    let { data, error } = await supabase.from('StateTable').select('LastPostedKey').limit(1);
    if (error) {
        console.error("Error fetching LastPostedKey:", error.message);
        throw error;
    }
    return data[0]?.LastPostedKey || 0;
}

async function setLastPostedKey(key) {
    // Fetch the first row to determine if a row exists
    const { data, error: fetchError } = await supabase.from('StateTable').select('LastPostedKey').limit(1);
    
    if (fetchError) {
        console.error("Error fetching from StateTable:", fetchError.message);
        throw fetchError;
    }

    if (data && data.length > 0) {
        // If a row exists, update it
        const { error: updateError } = await supabase.from('StateTable')
            .update({ LastPostedKey: key })
            .eq('LastPostedKey', data[0].LastPostedKey);
        
        if (updateError) {
            console.error("Error updating LastPostedKey:", updateError.message);
            throw updateError;
        }
    } else {
        // If no row exists, insert one
        const { error: insertError } = await supabase.from('StateTable')
            .insert([{ LastPostedKey: key }]);
        
        if (insertError) {
            console.error("Error inserting LastPostedKey:", insertError.message);
            throw insertError;
        }
    }
}

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
        
        // Divider messages
        channel.send("🔔 New Tasks 🔔");
        channel.send("\u200B");
        const date = new Date();
        channel.send(`📅 **Tasks for ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}** 📅`);
        channel.send("\u200B");
        
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

            console.log(`Task with Key: ${task.Key} posted. Last posted key is now: ${lastPostedKey}`);
        }

        if (tasks && tasks.length > 0) {
            const newLastPostedKey = tasks[tasks.length - 1].Key;
            await setLastPostedKey(newLastPostedKey);
        }

    } catch (error) {
        console.error('An error occurred:', error);
    }
}
