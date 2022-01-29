import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";

export const preprocessorOptions = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 }),
    saveCooldownInDb: false
})

export const slashCommand = new SlashCommandBuilder()
    .setName('hug')
    .setDescription("Hug someone")
    .addUserOption(o => o.setName('user').setDescription("Specifies who to hug.").setRequired(true))

export async function execute(i: CommandInteraction) {
    const user = i.options.getUser('user')
    if (i.user.id == user.id) return await i.reply({ content: "You hugged yourself.", ephemeral: true })
    if (user.id == i.client.user.id) return await i.reply({ content: "no.", ephemeral: true })
    if (user.bot) return await i.reply({ content: "You hugged a robot. Kinda weird but ok, not gonna question that", ephemeral: true })

    await i.reply({ content: `Aww, you hugged <@${user.id}>. How cute <a:cute_pika:802000934683148359>`, allowedMentions: { parse: [] } })
}