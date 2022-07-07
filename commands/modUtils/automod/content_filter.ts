import { Client, Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { isStringOffensive } from "./automod_utils.js";
import { analyzeComment, CommentAttributes } from "./api-wrapper.js";
import { randomUUID } from "crypto";

const client: Client = global.bot.djsClient
const GUILD_ID = '784491141022220309'
const BROADCAST_ID = '991980819499450459'
const WHITELISTED_ROLE_IDS = ['791516118120267806']
const broadcastChan = await client.channels.fetch(BROADCAST_ID) as TextChannel
const flaggedMessages = new Map<string, { link: string, content: string }[]>()
const delId = "polly-delete-automod-alert-tag"

client.on('messageCreate', async m => {
    if (m.guildId != GUILD_ID || !m.content || m.author.bot || m.author.system) return
    if (m.member.roles.cache.some(r => WHITELISTED_ROLE_IDS.includes(r.id))) return
    (m as any).tok = randomUUID()
    if (await isStringOffensive(m.content)) await handleFlagged(m)
})

client.on('interactionCreate', async i => {
    if (!i.isButton()) return
    if (i.customId != delId || i.channelId != BROADCAST_ID || i.guildId != GUILD_ID) return
    await (i.message as Message).delete()
    await i.deferUpdate()
})

async function handleFlagged(m: Message) {
    console.log(`handling token ${(m as any).tok}`)
    let arr = flaggedMessages.get(m.author.id)
    if (!arr) {
        const t1 = []
        flaggedMessages.set(m.author.id, t1)
        arr = t1
    }
    
    if (arr.length <= 3) {
        const ent = {
            content: m.content,
            link: m.url
        }
        arr.push(ent)
        setTimeout(() => {
            const index = arr.indexOf(ent)
            if (index) arr.splice(index, 1)
        }, 60 * 10 * 1000)
        if (arr.length == 3) {
            await broadcastChan.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor({ name: `${m.author.tag}`, iconURL: m.author.avatarURL() })
                        .setTitle("Objectionable Content")
                        .setDescription("Objectionable/offensive content being sent by a user has been detected. Please review prior to taking moderation actions as this was automatically generated, and thus may be incorrect or out of context.")
                        .setColor('#be5353')
                        .addFields([
                            { name: "Offender", value: `${m.author.tag} (${m.author.id})`, inline: false },
                            { name: "Message #1", value: `${arr[0].content.substring(0, 800)} ([click here to jump](${arr[0].link}))`, inline: true },
                            { name: "Message #2", value: `${arr[1].content.substring(0, 800)} ([click here to jump](${arr[1].link}))`, inline: true },
                            { name: "Message #3", value: `${arr[2].content.substring(0, 800)} ([click here to jump](${arr[2].link}))`, inline: true }
                        ])
                        .setFooter("Automated action")
                        .setTimestamp()
                ],
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setEmoji('🗑️')
                                .setCustomId(delId)
                                .setStyle('DANGER')
                                .setLabel("Dismiss")
                        )
                ]
            })
        }
    }
}