import { SlashCommandBuilder } from "@discordjs/builders";
import { randomUUID } from "crypto";
import { MessageActionRow, MessageButton, Permissions } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";
export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 1 }),
    saveCooldownInDb: true,
    serverOnly: true
});
export const slashCommand = new SlashCommandBuilder()
    .setName('pressf')
    .setDescription("Can we get a F in the chat?")
    .addStringOption(o => o.setName('reason').setDescription("What to press F for").setRequired(true));
export async function execute(i) {
    // checks
    if (!i.guild)
        return await i.reply({ content: "No one's going to press F in a private channel lol, run it in server when", ephemeral: true });
    if (!i.guild.me.permissionsIn(i.channel).has(Permissions.FLAGS.SEND_MESSAGES)
        || !i.guild.me.permissionsIn(i.channel).has(Permissions.FLAGS.VIEW_CHANNEL))
        return await i.reply({ content: "I can't send messages in this channel!", ephemeral: true });
    const fButtonI = `polly-pressf_${randomUUID()}`, filter = button => button.customId == fButtonI, pressedF = new Array(), buttonRow = new MessageActionRow()
        .addComponents(new MessageButton()
        .setCustomId(fButtonI)
        .setEmoji('996958179692920963')
        .setStyle('PRIMARY')), collector = i.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 60 * 1000, filter: filter });
    const msg = await i.channel.send({
        content: `Everyone, let's pay respects to ${i.options.getString('reason')}! Press the button to pay respects to our fallen solider <:salute:934716403376853002>`,
        components: [buttonRow],
        allowedMentions: { parse: [] }
    });
    await i.reply({ content: 'Successfully sent message!', ephemeral: true });
    collector.on('collect', async (inter) => {
        if (pressedF.includes(inter.user.id))
            return await inter.reply({ content: "You already pressed F!", ephemeral: true });
        pressedF.push(inter.user.id);
        await inter.reply({ content: `<@${inter.user.id}> has paid respects.`, allowedMentions: { parse: [] } });
    });
    collector.on('end', async () => {
        try {
            await msg.edit({
                content: msg.content + (pressedF.length > 0
                    ? `\nTime's up, **${pressedF.length}** people have paid respects.`
                    : "\n**0** people have paid respects. How sad."),
                components: [
                    new MessageActionRow()
                        .addComponents(new MessageButton()
                        .setCustomId(fButtonI)
                        .setEmoji('996958179692920963')
                        .setStyle(pressedF.length > 0 ? 'SUCCESS' : 'DANGER')
                        .setDisabled(true))
                ]
            });
            await i.channel.send({
                content: pressedF.length > 0
                    ? `**${pressedF.length}** people have paid respects to **${i.options.getString('reason')}**. F`
                    : `No one paid respects. F`,
                allowedMentions: { parse: [] }
            });
        }
        catch (_a) { }
    });
}
//# sourceMappingURL=pressf.js.map