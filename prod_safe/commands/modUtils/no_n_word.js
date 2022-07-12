import { MessageEmbed } from "discord.js";
const bannedWords = [
    "nigger",
    "nigga",
    "nigglet",
    "n!gger",
    "n!gga",
    "n1gger",
    "n1gga",
    "nigg@",
    "n!gg@",
    "ngger",
    "nlgga"
];
const client = global.bot.djsClient;
client.on('messageCreate', async (m) => {
    if (m.author.bot || !m.guild)
        return;
    const lowered = m.cleanContent.toLowerCase();
    for (const w of bannedWords) {
        if (lowered.includes(w)) {
            try {
                await m.delete();
            }
            catch (_a) { }
            try {
                if (m.member.bannable) {
                    try {
                        await m.member.createDM();
                        await m.member.send({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('RED')
                                    .setTitle("Uh oh!")
                                    .setDescription(`You were banned for using a banned phrase in your message: ${w}. If you believe this is in error, please join the support server at https://discord.gg/4YgdCPmWvM.`)
                                    .setTimestamp()
                            ]
                        });
                    }
                    catch (_b) { }
                    await m.member.ban({ reason: "Banned phrase usage found in message | Automated action.", days: 1 });
                }
                return;
            }
            catch (_c) { }
        }
    }
});
//# sourceMappingURL=no_n_word.js.map