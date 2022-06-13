import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed, Permissions, User } from "discord.js";
import { setHeistMode } from "../modUtils/welcome.js";
import { lockDown } from "../modUtils/lockdown.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";

let joinedUsers: User[], startTime: number, heistMode = false

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 1 }),
    saveCooldownInDb: true,
    serverOnly: true
})

export const slashCommand = new SlashCommandBuilder()
    .setName('heistmode')
    .setDescription('Turn on heist mode')
    .addSubcommand(s => s.setName('enable').setDescription('Enable heist mode'))
    .addSubcommand(s => s.setName('disable').setDescription('Disable heist mode')
        .addBooleanOption(o => o.setName('ban_freeloaders').setDescription("Determines whether to ban freeloaders or not")))

export async function execute(i: CommandInteraction) {
    if (!i.guild) return await i.reply({ content: "I don't know what made you think this but you need to run this in a server??", ephemeral: true })
    if (!(i.member.permissions as Readonly<Permissions>).has(Permissions.FLAGS.MANAGE_MESSAGES)) return await i.reply({ content: "You are missing the permission 'Manage Messages' required to run this command!", ephemeral: true })
    const mode = i.options.getSubcommand(true) == 'enable' ? true : false
        , banFreeloaders = mode == false ? i.options.getBoolean('ban_freeloaders') : false
    setHeistMode(mode)
    
    if (!banFreeloaders) {
        if (mode == true) {
            joinedUsers = []
            startTime = Math.floor(Date.now() / 1000)
            heistMode = true
        } else {
            joinedUsers = undefined
            startTime = undefined
            heistMode = false
        }
        await i.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#2eeb58')
                    .setDescription(`<:tick:930664226677227581> | Successfully ${mode ? "enabled" : "disabled"} heist mode.`)
                    .setTimestamp()
            ]
        })
    } else {
        if (!joinedUsers) return await i.reply({ content: "Heist mode is off lmao, I can't ban freeloaders", ephemeral: true })
        const msg = await i.reply(`Fetching freeloaders (this may take a while!)`), runner = i.user
        let failedCount = 0
        let freeloaderFileContents = ''
        const members = await i.guild.members.fetch()

        for (const user of joinedUsers) {
            try {
                if (!members.has(user.id)) {
                    freeloaderFileContents += `${user.tag} (ID: ${user.id})\n`
                }
            } catch { failedCount++ }
        }

        freeloaderFileContents = `List of freeloaders (${new Date(startTime * 1000).toUTCString()} -> ${new Date().toUTCString()}):\n----------------------------\n${freeloaderFileContents.trimEnd()}`

        joinedUsers = undefined
        startTime = undefined
        heistMode = false

        await i.channel.send({
            content: `<@${runner.id}>, I have your freeloader list!`,
            files: [{
                name: `freeloader_dump-${new Date().toISOString()}.txt`,
                attachment: Buffer.from(freeloaderFileContents)
            }]
        })
    }
}

export async function staticBlock() {
    (global.bot.djsClient as Client).on('guildMemberAdd', m => {
        if (Date.now() - m.user.createdAt.getTime() <= 2678000000 || lockDown) return
        if (heistMode && !joinedUsers[m.user.id]) joinedUsers.push(m.user)
    }).on('messageCreate', msg => {
        if (heistMode && !msg.author.bot) {
            if (msg.content) {
                const lowered = msg.content.toLowerCase()
                const m = "<#931590909500481538>, use ur eyes when??????"

                if (lowered.includes("heist") && lowered.includes("where")) {
                    msg.reply(m).catch(() => {})
                } else if (lowered.includes("ur mom")) {
                    msg.react('🐣').catch(() => {})
                }
            }
        }
    })
}