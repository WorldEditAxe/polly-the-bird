// POLLY!??
import { randomUUID } from "crypto";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { addCookies } from "./pollyDatabase.js";
const snooze = ms => new Promise(res => setTimeout(res, ms));
const sendChannel = '870193314413019216';
const timer = 60;
const client = global.bot.djsClient;
export async function sayHiToPolly(channel, ping) {
    const chan = channel;
    const id = 'polly_feed-' + randomUUID();
    const button = new MessageActionRow()
        .addComponents(new MessageButton()
        .setCustomId(id)
        .setEmoji('🍘')
        .setStyle('SUCCESS'));
    const gaveCookies = new Array();
    const collector = chan.createMessageComponentCollector({ componentType: 'BUTTON', time: 30000 });
    let cookies = 0;
    await chan.sendTyping();
    const msg = await chan.send({ embeds: [
            new MessageEmbed()
                .setTitle("POLLY IS HUNGRY")
                .setColor('#fcba03')
                .setDescription("GIVE POLLY CRACKER OR ELSE <:polly:932821900290310144>")
                .setFooter("Please do not feed Polly cookies IRL - PETA")
                .setTimestamp()
        ],
        content: ping ? "<@&784546863436005386>" : undefined,
        components: [button]
    });
    collector.on('collect', async (i) => {
        if (!i.customId.startsWith(id))
            return;
        if (gaveCookies.includes(i.user.id))
            return await i.reply({ content: "Polly says one cracker per person >:(", ephemeral: true });
        cookies += 1;
        await addCookies(i.user.id);
        await i.reply({ content: 'POLLY SAYS GOOD JOB AND CRACKER YUMMY', ephemeral: true });
        gaveCookies.push(i.user.id);
    });
    collector.on('end', async () => {
        try {
            if (cookies <= 0)
                await chan.send(`polly says 0 cracker too little. polly want feed!!!! POLLY WANTES FEDEEDRD`);
            else
                await chan.send(`Someone fed Polly, good job! Polly is happy and has ${cookies} cracker(s) :D`);
            await msg.edit({ embeds: [
                    new MessageEmbed()
                        .setTitle(cookies > 0 ? 'POLLY IS FULL' : 'POLLY IS HUNGRY')
                        .setColor(cookies > 0 ? 'GREEN' : 'RED')
                        .setDescription(cookies > 0 ? `POLLY HAS BEEN FED AND NOW HAS ${cookies} CRACKER(S) <:polly:932821900290310144>`
                        : `POLLY HAS NO CRACKER. POLLY WANT CRACKER. <:polly:932821900290310144>`)
                        .setFooter(msg.embeds[0].footer)
                        .setTimestamp()
                ],
                components: [
                    new MessageActionRow()
                        .addComponents(new MessageButton()
                        .setCustomId(`no moar cracker`)
                        .setDisabled(true)
                        .setEmoji('🍘')
                        .setStyle('SUCCESS'))
                ]
            });
        }
        catch (_a) { }
    });
}
async function loop() {
    while (true) {
        await sayHiToPolly(await client.channels.fetch(sendChannel), false);
        await snooze(timer * 60 * 1000 + (randomFrom(0, 10) * 60 * 1000));
    }
}
function randomFrom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export async function staticBlock() {
    const client = global.bot.djsClient;
    // we need status
    client.user.setStatus('idle');
    loop();
}
//# sourceMappingURL=pollyLib.js.map