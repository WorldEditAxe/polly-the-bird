import { Client, MessageEmbed } from "discord.js"

const MEDIA_CHANNEL = '870235473862344704'
const client: Client = global.bot.djsClient

client.on('messageCreate', async msg => {
    if (msg.channelId != MEDIA_CHANNEL) return
    if (msg.attachments.size <= 0 && !msg.content.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gmi)) {
        await msg.delete().catch(() => {})
        return
    }

    await msg.startThread({
        name: "Comments",
        autoArchiveDuration: 1440,
        reason: "Automated media thread creation."
    })
        .then(thread => {
            thread.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Media Comment Thread")
                        .setColor('#4573ed')
                        .setDescription("Comment on a media post sent by a server member.\nPlease read the server rules at <#787343840108478474> prior to commenting.")
                ]
            })
        })
})