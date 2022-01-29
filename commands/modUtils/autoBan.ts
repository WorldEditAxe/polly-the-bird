import { Client, MessageEmbed } from "discord.js"

const chan = '934375357124063252'

export async function staticBlock() {
    const client: Client = global.bot.djsClient

    client.on('messageCreate', async m => {
        if (!m.guild) return
        if (m.channel.id == chan) {
            try {
                if (!m.content.toLowerCase().includes('http://') || !m.content.toLowerCase().includes('https://')) {
                    if (m.deletable) await m.delete()
                    return
                }
                if (!m.member.bannable) return
                try { await m.author.createDM() }
                catch {}

                await m.author.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Oh no!')
                            .setColor('#ff2b2b')
                            .setDescription("It appears that you've talked in the channel #do-not-talk-here which is used to ban hacked accounts claiming to give out free Discord Nitro. If you've accidentally sent a message here on accident or if you just recovered your account after getting hacked, please [join our appeal server](https://discord.gg/4YgdCPmWvM).")
                            .setTimestamp()
                    ]
                }).catch()

                await m.member.ban({ reason: "Sent message in #do-not-talk-here | Automated action.", days: 1 })
            } catch {}
        }
    })
}