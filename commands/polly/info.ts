import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

export const slashCommand = new SlashCommandBuilder()
    .setName('about')
    .setDescription('Get information about the bot')

export async function execute(i: CommandInteraction) {
    await i.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("About the Bot")
                .setColor('#a89932')
                .setFooter('Polly smells yummy cookies')
                .setThumbnail(i.client.user.avatarURL())
                .setDescription(`Polly is a joke Discord bot made for the sole purpose of collecting cookies from you guys >:). Polly want cookie so gib!\n*Made with based bot framework and love*`)
                .setTimestamp()
        ]
    })
}