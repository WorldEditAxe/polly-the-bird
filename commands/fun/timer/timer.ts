import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildChannel, Message, MessageEmbed, Permissions, TextChannel } from "discord.js";
import { CommandPreprocessor } from "../../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../../lib/preprocessor/cooldownDate.js";
import { createTimer, deleteTimer, fetchTimer, parseTimeString } from "./timerDb.js";

export const preprocessorOptions = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 }),
    serverOnly: true,
    botPermissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY]
})

export const slashCommand = new SlashCommandBuilder()
    .setName('timer')
    .setDescription("Manage timers.")
    .addSubcommand(c => c.setName("create").setDescription("Create a new timer")
        .addStringOption(o => o.setName("time").setDescription("Specifies the time for the timer to last.").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("Sets the reason to start the timer.").setRequired(true)))
    .addSubcommand(c => c.setName("delete").setDescription("Deletes a timer")
        .addStringOption(o => o.setName("id").setDescription("The message ID of the timer to delete.").setRequired(true)))

export async function execute(i: CommandInteraction) {
    const type = i.options.getSubcommand(true)
    const time = type == 'create' ? i.options.getString("time") : undefined
    const reason = type == 'create' ? i.options.getString("reason") :  undefined
    const tmrId = type == 'delete' ? i.options.getString("id") : undefined

    if (type == 'create') {
        if (reason.length > 50) return await i.reply({ content: `Your timer description is too long. Please limit the length of your description to be \`50\` characters or shorter.` })
        if (time.length > 15) return await i.reply({ content: "Your timer's length is excessively long.", ephemeral: true })
        
        let parsedTime
        const instant = Math.floor(Date.now() / 1000)
        
        try {
            parsedTime = parseTimeString(time) + instant
        } catch (err) {
            return await i.reply({
                content: `I do not understand the time you gave me: ${err.message}\nPlease pass a valid time (i.e. 30min, 2d 30min).`
            })
        }

        if (parsedTime - instant > 157680000) return await i.reply({ content: "Your timer's length is excessively long. The max length of a timer is 5 years.", ephemeral: true })

        await i.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(reason)
                    .setColor('#a6a832')
                    .setDescription(`Ends <t:${parsedTime}:R>.`)
                    .setFooter({ text: `Timer initiated by ${i.user.tag}` })
                    .setTimestamp()
            ]
        })

        await createTimer({
            channelId: i.channel.id,
            messageId: (await i.fetchReply()).id,
            reason: reason,
            runner: i.user.id,
            timeBegin: instant,
            timeEnd: parsedTime
        })
    } else {
        if (!i.memberPermissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return await i.reply({ content: "You do not have the permission 'Manage Messages' required to run this command!", ephemeral: true })
        await i.deferReply()
        let msg: Message
        const timerId = await fetchTimer(tmrId)

        if (!timerId) {
             return await i.editReply("Cannot find any timer with the ID!")
        }

        const chan = await i.client.channels.fetch(timerId.channelId).catch() as GuildChannel

        if (chan.guildId != i.guildId || !chan || !(
            chan.permissionsFor(i.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)
            && chan.permissionsFor(i.guild.me).has(Permissions.FLAGS.VIEW_CHANNEL)
            && chan.permissionsFor(i.guild.me).has(Permissions.FLAGS.READ_MESSAGE_HISTORY)
        )) return await i.editReply("That timer is outside of this server and cannot be cancelled!")

        await deleteTimer(timerId.messageId)
        await i.editReply(`I've cancelled the timer in my code, editing message...`)

        msg = await (chan as TextChannel).messages.fetch(timerId.messageId).catch()

        if (!msg) {
            await deleteTimer(tmrId)
            await i.editReply("Failed to edit message: The message linked to the timer has been deleted.")
            return
        }

        await msg.edit({ embeds: [
            msg.embeds[0].setColor('#de3131').setDescription("Timer has been cancelled.")
        ] })

        await i.editReply(`I successfully cancelled the timer **${tmrId}**!`)
    }

}