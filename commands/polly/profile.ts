import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";
import { fetchDonos, prettify, stringize } from "../donations/donoDb.js";
import { getUserProfile } from "./pollyDatabase.js";

const format = Intl.NumberFormat('en-US')

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 })
})

export const slashCommand = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile or someone else\'s')
//  .addStringOption(o => o.setRequired(true).setName('type').setDescription('The type of profile to view').addChoices([ [ 'polly', 'polly' ], [ 'donations', 'donations' ] ]))
    .addUserOption(o => o.setName('user').setDescription('The user to see the profile of').setRequired(false))

export async function execute(i: CommandInteraction) {
    const user = i.options.getUser('user') || i.user

    const info = await fetchDonos(user.id)
               , cumulativeTotal = info.giveaways + info.heists + info.events + info.special
               , pollyCookie = await getUserProfile(user.id)

    return await i.reply({ embeds: [
        new MessageEmbed()
            .setTitle(`${user.username}'s Donations`)
            .setThumbnail(user.avatarURL())
            .setTimestamp()
            .setColor(cumulativeTotal > 5000000 ? '#d9d900' : '#ff80c0')
            .addFields(
                { name: 'Giveaway Donations', value: stringize(info.giveaways), inline: true },
                { name: 'Heist Donations', value: stringize(info.heists), inline: true },
                { name: 'Event Donations', value: stringize(info.events), inline: true },
                { name: 'Special Donations', value: stringize(info.special), inline: true },
                { name: 'Money Donations', value: stringize(info.money, true), inline: true },
                { name: 'Total (excluding money)', value: stringize(cumulativeTotal), inline: true },
                { name: "Polly Crackers", value: `\`🍘 ${prettify(pollyCookie.cookies)}\` (started <t:${pollyCookie.startDate}:R>, date: <t:${pollyCookie.startDate}>)` })
    ] })
}