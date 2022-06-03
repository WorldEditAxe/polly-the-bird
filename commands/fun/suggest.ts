import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";

const suggestionsChannel = process.env.POLLY_DEVELOPMENT_MODE == 'true' ? '967282757132754974' : '870234228766425119', chanObj = await (global.bot.djsClient as Client).channels.fetch(suggestionsChannel) as TextChannel

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 5 }),
    saveCooldownInDb: true,
    serverOnly: true
})
export const slashCommand = new SlashCommandBuilder()

    .setName('suggest')
    .setDescription('Suggest something')
    .addStringOption(o => o.setName('suggestion').setDescription('The suggestion to suggest').setRequired(true))

export async function execute(i: CommandInteraction) {
    if (!i.guild) return await i.reply({ content: "Please run this command in a server.", ephemeral: true })
    if (i.options.getString('suggestion').length > 950) return await i.reply({ content: "We appreciate your enthusiasm, but please limit your suggestion message's length to be shorter than `950` characters.", ephemeral: true })
    const m = i.member as GuildMember

    await i.deferReply({ ephemeral: true })
    const message = await chanObj.send({
        embeds: [
            new MessageEmbed()
                .setAuthor(m.user.tag, m.displayAvatarURL())
                .setColor('#cff10e')
                .setDescription("**Suggestion**:\n" + i.options.getString('suggestion'))
                .setFooter(`ID: ${i.user.id}`)
                .setTimestamp()
        ],
        allowedMentions: { parse: [] } 
    })

    await message.react('⬆️')
    await message.react('⬇️')

    await i.editReply({ content: "I sent your poll message, go check it out!" })
}