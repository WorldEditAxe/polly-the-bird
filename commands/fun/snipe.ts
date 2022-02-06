import { SlashCommandBuilder } from "@discordjs/builders"
import { Client, CommandInteraction, GuildMemberRoleManager, Message, MessageEmbed, Permissions, TextChannel } from "discord.js"
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js"
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js"

const snipe = new Map<string, Message>()
const snooze = ms => new Promise<void>(res => setTimeout(res, ms))

export const preprocessorOptions = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 }),
    saveCooldownInDb: false
})

export const slashCommand = new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('ur mum')

export async function execute(i: CommandInteraction) {
    if (!i.guild) return await i.reply({ content: 'imagine not using this in a server smfh', ephemeral: true })
    if (!i.guild.me.permissionsIn(i.channel as any).has(Permissions.FLAGS.VIEW_CHANNEL)) return await i.reply({ content: "I cannot snipe in a channel where I do not have the permissions to view sent messages in.", ephemeral: true })
    if (!(i.member.roles as GuildMemberRoleManager).cache.has('799022090791419954') && !(i.member.roles as GuildMemberRoleManager).cache.has('785676961904852992')) return await i.reply({ content: "You need to be a 25 million donor in order to use this command!", ephemeral: true })
    const snipedMessage = snipe.get(i.channel.id)
    if (!snipedMessage) return await i.reply({ content: 'hey bud there ain\'t any sniped messages here' })
    const attachments = snipedMessage.attachments

    const embed = new MessageEmbed()
    .setAuthor(snipedMessage.author.tag, snipedMessage.author.avatarURL())
    .setTitle(`Sniped message in #${(i.channel as TextChannel).name}`)
    .setDescription(snipedMessage.content && snipedMessage.content.length > 0
                    ? snipedMessage.content.length > 2000 ? snipedMessage.content.slice(0, 1997) + '...' : snipedMessage.content
                    : "<nothing, maybe an embed/attachment?>")
    .setTimestamp(snipedMessage.createdAt)

    if (attachments.size > 0) {
        let linkStr = '', index = 0

        attachments.forEach((v, k) => {
            index++
            linkStr += `[${index}]: [${v.name}](${v.url})\n`
        })

        embed.addField("Attachments", linkStr.trimEnd(), true)
    }

    await i.reply({ embeds: [ embed ] })
}

export async function staticBlock() {
    const client: Client = global.bot.djsClient
    
    client.on('messageDelete', async m => {
        if (!m.guild || m.author.bot) return
        snipe.set(m.channel.id, m as Message)
        await snooze(10 * 60 * 1000)
        if (snipe.has(m.channel.id)) snipe.delete(m.channel.id)
    })
}