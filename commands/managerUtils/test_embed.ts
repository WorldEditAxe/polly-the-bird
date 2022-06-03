import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { renderEmbed } from "./hangman.js";

export const slashCommand = new SlashCommandBuilder()
    .setName("test")
    .setDescription("Testing command lol")

export async function execute(i: CommandInteraction) {
    return await i.reply({
        embeds: [
            renderEmbed({
                failed: false,
                guessedCorrectLetters: ['a', 'b', 'c'],
                guessedIncorrectLetters: ['d', 'e', 'f'],
                word: "ur mom",
                state: 'PLAYING'
            })
        ]
    })
}