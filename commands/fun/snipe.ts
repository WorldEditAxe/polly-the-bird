import { SlashCommandBuilder } from "@discordjs/builders"
import { Client, CommandInteraction, GuildChannel, GuildMemberRoleManager, Message, MessageEmbed, Permissions, TextChannel, User } from "discord.js"
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js"
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js"

const snipe = new Map<string, Array<DeletedMessage | EditedMessage>>()
const snooze = ms => new Promise<void>(res => setTimeout(res, ms))

type loggedType = 'DELETED' | 'EDITED'

type DeletedMessage = {
    messageId: string,
    content: string,
    attachments: string[],
    author: User,
    channel: GuildChannel,
    type: 'DELETED'
}

type EditedMessage = {
    messageId: string
    messageJumpLink: string,
    oldContent: string,
    newContent: string,
    author: User,
    channel: GuildChannel,
    type: 'EDITED'
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
    } else {
        // send latest sniped msg
        const msg = snipe.get(i.channelId)
        if (!msg || msg.length < 1) return await i.reply({ content: "Did you expect something to be here? Sadly, there isn't any.", ephemeral: true })
        const m = msg[0]

        if (m.type == 'DELETED') {}

        await i.reply({
            embeds: [
                new MessageEmbed()
                    .setAuthor({ name: m.author.tag, iconURL: m.author.displayAvatarURL() })
                    .setTitle(`Sniped message in #${m.channel.name}`)
                    .setDescription(m.type == 'DELETED' ? m.content || "<nothing, maybe an embed or attachment?>" : m.)
            ]
        })
    }
}

export async function staticBlock() {
    const client: Client = global.bot.djsClient
    
    client.on('messageDelete', async m => {
        if (!m.guild || m.author.bot) return
        if (!snipe.has(m.channelId)) snipe.set(m.channelId, new Array<any>())
        const attachments = []
        m.attachments.forEach(a => attachments.push(a.url))

        appendAndClamp(snipe.get(m.channelId), {
            messageId: m.id,
            content: m.content,
            attachments: attachments,
            author: m.author,
            channel: m.channel as any,
            type: 'DELETED'
        } as DeletedMessage, 10)
    })

    client.on('messageUpdate', (before, after) => {
        if (!after.guild || after.author.bot) return
        if (!snipe.has(after.channelId)) snipe.set(m.channelId, new Array<any>())

        appendAndClamp(snipe.get(after.channelId), {
            messageId: after.id,
            messageJumpLink: after.url,
            oldContent: before.content,
            newContent: after.content,
            author: after.author,
            channel: m.channel as any,
            type: 'EDITED'
        } as EditedMessage, 10)
    })
}

function appendAndClamp(array: Array<any>, element: any, limit: number) {
    if (array.length > limit) {
        array.unshift(element)
        array.pop
    } else {
        array.unshift(element)
    }
}