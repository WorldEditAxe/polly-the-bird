import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const slashCommand = new SlashCommandBuilder()
    .setName('pilly')
    .setDescription('Pilly vs Polly: who will win??')

export async function execute(i: CommandInteraction) {
    await i.reply(Math.random() > 0.5 ? "Polly won smfh" : "Pilly won smfh")
}