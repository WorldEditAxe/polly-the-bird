import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";
const suggestionsChannel = '870234228766425119', chanObj = await global.bot.djsClient.channels.fetch(suggestionsChannel);
export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 5 }),
    saveCooldownInDb: true,
    serverOnly: true
});
export const slashCommand = new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Suggest something')
    .addStringOption(o => o.setName('suggestion').setDescription('The suggestion to suggest').setRequired(true));
export async function execute(i) {
    if (!i.guild)
        return await i.reply({ content: "Please run this command in a server.", ephemeral: true });
    if (i.options.getString('suggestion').length > 950)
        return await i.reply({ content: "We appreciate your enthusiasm, but please limit your suggestion message's length to be shorter than `950` characters.", ephemeral: true });
    const m = i.member;
    await i.deferReply({ ephemeral: true });
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
    });
    await message.react('⬆️');
    await message.react('⬇️');
    await i.editReply({ content: "I sent your poll message, go check it out!" });
}
//# sourceMappingURL=suggest.js.map