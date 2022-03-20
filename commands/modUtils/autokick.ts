import { Client, MessageEmbed } from "discord.js";

export async function staticBlock() {
    const client: Client = global.bot.djsClient

    client.on('guildMemberAdd', async m => {
        if (Date.now() - m.user.createdAt.getTime() <= 2678000000) {
            // get the unix timestamp of when the user can rejoin
            const timeUntilRejoin = Math.floor((Date.now() + (2678000000 - (Date.now() - m.user.createdAt.getTime()))) / 1000)

            try {
                await m.user.createDM().catch()

                const msg = await m.user.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Uh oh!")
                            .setColor('#ff4040')
                            .setDescription(`It looks like your account is too young. You may attempt rejoining <t:${timeUntilRejoin}:R>.\nIf you believe this is in error, please join our ban appeal server [here](https://discord.gg/4YgdCPmWvM).`)
                            .setTimestamp()
                    ]
                })

                try { await m.kick("Account below age of 1 month/30 days | Automated action.") }
                catch { await msg.delete() }
            } catch {}
        }
    })
}