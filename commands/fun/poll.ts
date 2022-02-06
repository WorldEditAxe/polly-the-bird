import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildChannel, Permissions, TextChannel } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";

export const preprocessorOptions = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 1 }),
    saveCooldownInDb: true
})

export const slashCommand = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a new poll')
    .addStringOption(o => o.setName('question').setDescription('The question to ask').setRequired(true))

export async function execute(i: CommandInteraction) {
    if (!i.guild) return await i.reply({ content: "Who's gonna react to your poll inside of your DMs?? Please run this command in a server.", ephemeral: true })
    if (!i.guild.me.permissionsIn(i.channel as any).has(Permissions.FLAGS.SEND_MESSAGES)) return await i.reply({ content: "I do not have the permissions to send messages in this channel!", ephemeral: true })
    
    await i.deferReply({ ephemeral: true })
    const message = await (i.channel as TextChannel).send({ content: `<@${i.user.id}> asks: ${i.options.getString('question')}`, allowedMentions: { parse: [] } })

    await message.react('👍')
    await message.react('👎')

    await i.editReply({ content: "I sent your poll message, go check it out!" })
}