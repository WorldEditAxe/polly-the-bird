import { SlashCommandBuilder } from "@discordjs/builders"
import { Client, CommandInteraction, Message, MessageEmbed, TextChannel } from "discord.js"

const snipe = new Map<string, Message>()
const snooze = ms => new Promise<void>(res => setTimeout(res, ms))

export const slashCommand = new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('ur mum')

export async function execute(i: CommandInteraction) {
    if (!i.guild) return await i.reply({ content: 'imagine not using this in a server smfh', ephemeral: true })
    const snipedMessage = snipe.get(i.channel.id)
    if (!snipedMessage) return await i.reply({ content: 'hey bud there ain\'t any sniped messages here bud' })

    await i.reply({ embeds: [
        new MessageEmbed()
            .setAuthor(snipedMessage.author.tag, snipedMessage.author.avatarURL())
            .setTitle(`Sniped message in #${(i.channel as TextChannel).name}`)
            .setDescription(snipedMessage.content && snipedMessage.content.length > 0
                            ? snipedMessage.content
                            : "<nothing, maybe an embed/attachment?>")
            .setTimestamp()
    ] })
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