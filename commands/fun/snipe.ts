import { SlashCommandBuilder } from "@discordjs/builders"
import { 
    Client, 
    CommandInteraction, 
    GuildChannel, 
    GuildMemberRoleManager, 
    MessageEmbed, 
    Permissions, 
    User 
} from "discord.js"
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js"
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js"

const snipe = new Map<string, Array<DeletedMessage | EditedMessage>>()
const snooze = ms => new Promise<void>(res => setTimeout(res, ms))

type loggedType = 'DELETED' | 'EDITED'

type DeletedMessage = {
    messageId: string,
    content: string,
    attachments: { name: string, url: string }[],
    author: User,
    channel: GuildChannel,
    deleteTime: number,
    type: 'DELETED'
}

type EditedMessage = {
    messageId: string
    messageJumpLink: string,
    oldContent: string,
    newContent: string,
    attachments: { old: { name: string, url: string }[], new: { name: string, url: string }[] },
    author: User,
    channel: GuildChannel,
    updateTime: number,
    type: 'EDITED'
}

function getAttachmentString(attachments: { name: string, url: string }[], short?: boolean): string {
    let ret = "", i = 0

    if (!short) {
        attachments.forEach(v => {
            i++
            ret += `[${i}]: [${v.name}](${v.url})\n`
        })
    
        return ret
    } else {
        if (attachments.length > 3) {
            return "<too long to display properly>"
        }

        attachments.forEach(v => {
            i++

            if (i + 1 < attachments.length) {
                ret += `[${v.name}](${v.url}, `
            } else {
                ret += `[${v.name}](${v.url}`
            }
        })

        return ret
    }
}

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 }),
    saveCooldownInDb: false,
    serverOnly: true
})

export const slashCommand = new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('ur mum')
    .addBooleanOption(o => o.setName("list").setDescription("Whether or not to show a snipelist or not.").setRequired(false))

export async function execute(i: CommandInteraction) {
    if (!i.guild) return await i.reply({ content: 'imagine not using this in a server smfh', ephemeral: true })
    if (!i.guild.me.permissionsIn(i.channel as any).has(Permissions.FLAGS.VIEW_CHANNEL)) return await i.reply({ content: "I cannot snipe in a channel where I do not have the permissions to view sent messages in.", ephemeral: true })
    if (!(i.member.roles as GuildMemberRoleManager).cache.has('799022090791419954') && !(i.member.roles as GuildMemberRoleManager).cache.has('929898376001122325') && !(i.member.roles as GuildMemberRoleManager).cache.has('785676961904852992')) return await i.reply({ content: "You need to be a 25 million donor in order to use this command!", ephemeral: true })
    const list = typeof i.options.getBoolean("list") == 'boolean' ? i.options.getBoolean("list") : false

    // TODO: work on
    if (list) {
        // send snipelist
        const msg = snipe.get(i.channelId)
        if (!msg || msg.length < 1) return await i.reply({ content: "there aren't any sniped messages <:Kek:790750951882358835> tf u lookin for", ephemeral: true })

        const emb = new MessageEmbed()
            .setColor('YELLOW')
            .setTitle(`Sniped messages in #${i.channel.name}`)
            .setDescription(`Showing ${msg.length} (of max 10) sniped messages in this channel.`)
            .setTimestamp()

        for (const message of msg) {
            if (message.type == 'DELETED') {
                let str = `**Author: **${message.author.tag}\n`
                
                if (message.attachments.length > 0) str += `**Attachments: ** ${getAttachmentString(message.attachments, true)}\n`

                str += `**Content:** ${message.content ? message.content.length > (500 - str.length) ? message.content.slice(0, 500 - str.length) + '...' : message.content : message.content.length <= 500 - str.length + 37 ? "<nothing, possible embed/attachment?>" : ''}\n`

                emb.addFields({
                    name: `#${msg.indexOf(message) + 1} [${message.type}]`,
                    value: str,
                    inline: true
                })
            } else {
                // TODO: work on esnipe
                let str = `**Author : **${message.author.tag}\n`

                if (message.attachments.old.length > 0) str += `**Old Attachments: ** ${getAttachmentString(message.attachments.old, true)}\n`
                if (message.attachments.new.length > 0) str += `**New Attachments: ** ${getAttachmentString(message.attachments.new, true)}\n`

                str += `**Old Content:** ${message.oldContent ? message.oldContent.length > (256 - str.length) ? message.oldContent.slice(0, 256 - str.length) + '...' : message.oldContent : message.oldContent.length <= 256 - str.length + 37 ? "<nothing, possible embed/attachment?>" : ''}\n`
                str += `**New Content:** ${message.newContent ? message.newContent.length > (1000 - str.length) ? message.newContent.slice(0, 1000 - str.length) + '...' : message.newContent : message.newContent.length <= 1000 - str.length + 37 ? "<nothing, possible embed/attachment?>" : ''}`

                emb.addFields({
                    name: `#${msg.indexOf(message) + 1} [${message.type}]`,
                    value: str,
                    inline: true
                })
            }
        }

        await i.reply({
            embeds: [
                emb
            ],
            ephemeral: true
        })

    } else {
        // send latest sniped msg
        const msg = snipe.get(i.channelId)
        if (!msg || msg.length < 1) return await i.reply({ content: "there aren't any sniped messages <:Kek:790750951882358835> tf u lookin for", ephemeral: true })
        const m = msg[0]

        if (m.type == 'DELETED') {
            console.log(m.deleteTime)
            const emb = new MessageEmbed()
                .setColor('DARK_RED')
                .setTitle(`Message deleted in channel #${i.channel.name}`)
                .setDescription(m.content ? m.content.length > 2000 ? m.content.slice(0, 1997) + '...' : m.content : "<nothing, maybe an embed or some attachments?>")
                .setTimestamp(m.deleteTime)
                .setAuthor({ name: m.author.username, iconURL: m.author.avatarURL() })
            
            if (m.attachments && m.attachments.length > 0) {
                emb.addFields({ name: "Attachments", value: getAttachmentString(m.attachments), inline: true })
            }

            await i.reply({ embeds: [emb] })
        } else {
            const emb = new MessageEmbed()
                .setColor('YELLOW')
                .setTitle(`Message edited in channel #${i.channel.name}`)
                .setAuthor({ name: m.author.username, iconURL: m.author.avatarURL() })
                .addFields(
                    { name: "Old Content", value: m.oldContent ? m.oldContent.length > 1024 ? m.oldContent.slice(0, 1021) + '...' : m.oldContent : "<nothing, maybe an embed or some attachments?>" },
                    { name: "New Content", value: m.newContent ? m.newContent.length > 1024 ? m.newContent.slice(0, 1021) + '...' : m.newContent : "<nothing, maybe an embed or some attachments?>" }
                )
                .setTimestamp(m.updateTime)
            
            if (m.attachments.old && m.attachments.old.length > 0) {
                const str = getAttachmentString(m.attachments.old)
                emb.addFields({
                    name: "Old Attachments",
                    value: str.length > 1024 ? "<too long to fit in embed>" : str,
                    inline: false
                })
            }

            if (m.attachments.new && m.attachments.new.length > 0) {
                const str = getAttachmentString(m.attachments.new)
                emb.addFields({
                    name: "New Attachments",
                    value: str.length > 1024 ? "<too long to fit in embed>" : str,
                    inline: false
                })
            }

            await i.reply({ embeds: [emb] })
        }
    }
}

export async function staticBlock() {
    const client: Client = global.bot.djsClient
    
    client.on('messageDelete', async m => {
        if (!m.guild || m.author.bot) return
        if (!snipe.has(m.channelId)) snipe.set(m.channelId, new Array<any>())
        const attachments = []
        m.attachments.forEach(a => attachments.push({ name: a.name, url: a.url }))

        appendAndClamp(snipe.get(m.channelId), {
            messageId: m.id,
            content: m.content,
            attachments: attachments,
            author: m.author,
            channel: m.channel as any,
            deleteTime: Math.floor(Date.now() / 1000),
            type: 'DELETED'
        } as DeletedMessage, 10)
    })

    client.on('messageUpdate', (before, after) => {
        if (!after.guild || after.author.bot) return
        if (!snipe.has(after.channelId)) snipe.set(before.channelId, new Array<any>())

        // fill out attachments field
        const old = [], n = []

        before.attachments.forEach(v => old.push({ name: v.name, url: v.url }))
        after.attachments.forEach(v => n.push({ name: v.name, url: v.url }))

        appendAndClamp(snipe.get(after.channelId), {
            messageId: after.id,
            messageJumpLink: after.url,
            oldContent: before.content,
            newContent: after.content,
            author: after.author,
            attachments: { old: old, new: n },
            channel: after.channel as any,
            updateTime: Math.floor(Date.now() / 1000),
            type: 'EDITED'
        } as EditedMessage, 10)
    })
}

function appendAndClamp(array: Array<any>, element: any, limit: number) {
    if (array.length > limit) {
        array.unshift(element)
        array.pop()
    } else {
        array.unshift(element)
    }
}
