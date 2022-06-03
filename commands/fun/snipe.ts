import { SlashCommandBuilder } from "@discordjs/builders"
import { Client, CommandInteraction, GuildMember, GuildMemberRoleManager, Message, MessageEmbed, Permissions, TextChannel } from "discord.js"
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js"
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js"

const snipe = new Map<string, Message[]>()
const snooze = ms => new Promise<void>(res => setTimeout(res, ms))

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 }),
    saveCooldownInDb: false,
    serverOnly: true
})

export const slashCommand = new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('snip snipe!?')
    .addSubcommand(c => c.setName("snipe").setDescription("Snipes the latest sniped message."))
    .addSubcommand(c => c.setName("snipelist").setDescription("Get the last 10 sniped messages in a channel."))

export async function execute(i: CommandInteraction) {
    if (!i.guild) return await i.reply({ content: 'imagine not using this in a server smfh', ephemeral: true })
    if (!i.guild.me.permissionsIn(i.channel as any).has(Permissions.FLAGS.VIEW_CHANNEL)) return await i.reply({ content: "I cannot snipe in a channel where I do not have the permissions to view sent messages in.", ephemeral: true })
    const cmdType: 'snipe' | 'snipelist' = i.options.getSubcommand() as any

    if (cmdType == 'snipe') {
        if (!(i.member.roles as GuildMemberRoleManager).cache.has('799022090791419954') && !(i.member.roles as GuildMemberRoleManager).cache.has('929898376001122325') && !(i.member.roles as GuildMemberRoleManager).cache.has('785676961904852992')) return await i.reply({ content: "You need to be a 25 million donor in order to use this command!", ephemeral: true })
        let sm = snipe.get(i.channel.id)
        if (!sm || sm.length <= 0) return await i.reply({ content: 'hey bud there ain\'t any sniped messages here', ephemeral: true })
        let snipedMessage = sm[0]
        const attachments = snipedMessage.attachments

        const embed = new MessageEmbed()
        .setColor('#fcba03')
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
    } else {
        let mbr = i.member
        if (mbr !instanceof GuildMember) mbr = await i.guild.members.fetch(mbr.id)
        if (!(mbr as GuildMember).roles.cache.has('787734881563705354')) return await i.reply({ content: "You need the Premium role in order to run this command!", ephemeral: true })

        const sniped_msgs = snipe.get(i.channel.id)
        const emb = new MessageEmbed()
        if (!sniped_msgs || sniped_msgs.length <= 0) return await i.reply({ content: "There seems to be no sniped messages here, interesting... :thinking:", ephemeral: true })

        emb
            .setColor('#fcba03')
            .setTitle(`Sniped message${sniped_msgs.length > 1 ? 's' : ''} in #${(i.channel as TextChannel).name}`)
            .setDescription(`**Showing all ${sniped_msgs.length} (of max 10) sniped messages in this channel.**`)

        sniped_msgs.forEach((m, i) => {
            let fieldContent = `**Author:** ${m.author.tag}`
            if (m.attachments.size > 0) {
                fieldContent += "\n**Attachments:** "
                let index = 0

                if (m.attachments.size > 3) {
                    fieldContent += "<too long to properly display>"
                } else {
                    m.attachments.forEach(v => {
                        index++
                        fieldContent += `[${v.name}](${v.url})${index < m.attachments.size ? ", " : ''}`
                    })
                }
            }

            fieldContent += `\n**Content:** ${m.content ? m.content.length > (1000 - fieldContent.length) ? m.content.slice(0, 1000 - fieldContent.length) + '...' : m.content : m.content.length <= 1000 - fieldContent.length + 37 ? "<nothing, possible embed/attachment?>" : ''}`
            emb.addField(`#${i + 1}`, fieldContent, true)
        })

        emb.setTimestamp()
        await i.reply({ embeds: [emb], ephemeral: true })
    }
}

export async function staticBlock() {
    const client: Client = global.bot.djsClient
    
    client.on('messageDelete', async m => {
        if (!m.guild || m.author.bot) return
        if (!snipe.has(m.channel.id)) {
            snipe.set(m.channel.id, [m as any])
        } else {
            const arr = snipe.get(m.channel.id)

            if (arr.length >= 10) {
                arr.unshift(m as any)
                arr.pop()
            } else {
                arr.unshift(m as any)
            }
        }
    })
}