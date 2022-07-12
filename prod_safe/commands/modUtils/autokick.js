import { MessageEmbed } from "discord.js";
import { isStringDirty } from "./automod/automod_utils.js";
export async function staticBlock() {
    const client = global.bot.djsClient;
    client.on('guildMemberAdd', async (m) => {
        if (Date.now() - m.user.createdAt.getTime() <= 2678000000 && !isStringDirty(m.user.username)) {
            // get the unix timestamp of when the user can rejoin
            const timeUntilRejoin = Math.floor((Date.now() + (2678000000 - (Date.now() - m.user.createdAt.getTime()))) / 1000);
            try {
                await m.user.createDM().catch();
                const msg = await m.user.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Uh oh!")
                            .setColor('#ff4040')
                            .setDescription(`It looks like your account is too young. You may attempt rejoining <t:${timeUntilRejoin}:R>.\nIf you believe this is in error, please join our ban appeal server [here](https://discord.gg/4YgdCPmWvM).`)
                            .setTimestamp()
                    ]
                });
                try {
                    await m.kick("Account below age of 1 month/30 days | Automated action.");
                }
                catch (_a) {
                    await msg.delete();
                }
            }
            catch (_b) { }
        }
    });
}
//# sourceMappingURL=autokick.js.map