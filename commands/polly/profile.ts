import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { getUserProfile } from "./pollyDatabase.js";

const format = Intl.NumberFormat('en-US')

export const slashCommand = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View the profile of you or someone else\'s')
    .addUserOption(o => o.setName('user').setDescription('The user to see the profile of').setRequired(false))

export async function execute(i: CommandInteraction) {
    const user = i.options.getUser('user') || i.user
    const profile = await getUserProfile(user.id)

    await i.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`${user.username}${user.username.endsWith('s') ? '\'' :  '\'s'} Profile`)
            .setColor('#32a852')
            .setTimestamp()
            .setThumbnail(user.avatarURL())
            .addFields({ name: 'Crackers', value: `\`${format.format(profile.cookies)}\` crackers`, inline: true }
                     , { name: 'Start Date', value: `<t:${profile.startDate}>`, inline: true })
            .setFooter(profile.cookies > 10 ? 'Polly happy :D' : 'polly wants more cracker >:c')
    ] })
}