import { Client, MessageEmbed } from "discord.js";

const chanId = '870234113179791390'
const pingIds = [
    '848660704969359441',
    '925874127892541440',
    '879438992658018364',
    '874369843359539231',
    '891760013155131432',
    '848039592140865577',
    '879439271096893480',
    '883734468341403669',
    '892383997836009482'
]

export async function staticBlock() {
    const client: Client = global.bot.djsClient

    client.on('messageCreate', async m => {
        if (m.channel.id == chanId && pingIds.some(element => m.mentions.has(element))) {
            try {
                const thread = await m.startThread({ name: 'Comments', autoArchiveDuration: 1440, reason: "Comment thread for staff shitpost | Automated action." })
                await thread.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Staff Shitpost Thread")
                            .setColor('#4573ed')
                            .setDescription(`Comment on a post sent by a staff member.\nPlease read the server rules at <#787343840108478474> prior to posting.`)
                            .setTimestamp()
                    ]
                })
            } catch {}
        }
    })
}