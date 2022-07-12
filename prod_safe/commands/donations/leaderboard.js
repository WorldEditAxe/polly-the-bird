import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";
import { currency_symbol, db, prettify } from "./donoDb.js";
export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 5 }),
    serverOnly: true
});
export const slashCommand = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription("See the donation leaderboard")
    .addStringOption(o => o.setName('type').setDescription("The type of donations you want to view the leaderboard of").setRequired(false)
    .addChoice('giveaways', 'GIVEAWAYS')
    .addChoice('heists', 'HEISTS')
    .addChoice('events', 'EVENTS')
    .addChoice('special', 'SPECIAL')
    .addChoice('money', 'MONEY')
    .addChoice('total', 'TOTAL'))
    .addBooleanOption(o => o.setName("id").setDescription("Whether or not to include IDs").setRequired(false));
export async function execute(interaction) {
    const type = interaction.options.getString('type') || 'TOTAL';
    const showIds = interaction.options.getBoolean('id') || false;
    let leaderboard, str = `**Showing top #10 for type ${type.toLowerCase()}.**\n`;
    if (type != 'TOTAL') {
        leaderboard = await db.find({ [type.toLowerCase()]: { $gt: 0 } }).sort({ [type.toLowerCase()]: -1 }).limit(10).toArray();
        for (let i = 0; i < leaderboard.length; i++) {
            const trueIndex = i + 1;
            if (trueIndex == 1) {
                str += `🥇: ${(await interaction.client.users.fetch(leaderboard[i].user_id)).tag}${showIds ? ` (${leaderboard[i].user_id})` : ""} - \`${type == 'MONEY' ? "" : `${currency_symbol} `}${prettify(leaderboard[i][type.toLowerCase()], type == 'MONEY')}\`\n`;
            }
            else if (trueIndex == 2) {
                str += `🥈: ${(await interaction.client.users.fetch(leaderboard[i].user_id)).tag}${showIds ? ` (${leaderboard[i].user_id})` : ""} - \`${type == 'MONEY' ? "" : `${currency_symbol} `}${prettify(leaderboard[i][type.toLowerCase()], type == 'MONEY')}\`\n`;
            }
            else if (trueIndex == 3) {
                str += `🥉: ${(await interaction.client.users.fetch(leaderboard[i].user_id)).tag}${showIds ? ` (${leaderboard[i].user_id})` : ""} - \`${type == 'MONEY' ? "" : `${currency_symbol} `}${prettify(leaderboard[i][type.toLowerCase()], type == 'MONEY')}\`\n`;
            }
            else {
                str += `**#${trueIndex}:** ${(await interaction.client.users.fetch(leaderboard[i].user_id)).tag}${showIds ? ` (${leaderboard[i].user_id})` : ""} - \`${type == 'MONEY' ? "" : `${currency_symbol} `}${prettify(leaderboard[i][type.toLowerCase()], type == 'MONEY')}\`\n`;
            }
        }
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Donation Leaderboard`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setColor('#cfad25')
                    .setDescription(str.trimEnd())
                    .setTimestamp()
            ]
        });
    }
    else {
        leaderboard = await db.aggregate([{ $project: { giveaways: 1, heists: 1, events: 1, special: 1, user_id: 1, orderBySumValue: { $add: ["$giveaways", "$heists", "$events", "$special"] } } }, { $sort: { orderBySumValue: -1 } }, { $limit: 10 }]).toArray();
        for (let i = 0; i < leaderboard.length; i++) {
            const trueIndex = i + 1;
            if (trueIndex == 1) {
                str += `🥇: ${(await interaction.client.users.fetch(leaderboard[i].user_id)).tag}${showIds ? ` (${leaderboard[i].user_id})` : ""} - \`${`${currency_symbol} `}${prettify(leaderboard[i]["orderBySumValue"])}\`\n`;
            }
            else if (trueIndex == 2) {
                str += `🥈: ${(await interaction.client.users.fetch(leaderboard[i].user_id)).tag}${showIds ? ` (${leaderboard[i].user_id})` : ""} - \`${`${currency_symbol} `}${prettify(leaderboard[i]["orderBySumValue"])}\`\n`;
            }
            else if (trueIndex == 3) {
                str += `🥉: ${(await interaction.client.users.fetch(leaderboard[i].user_id)).tag}${showIds ? ` (${leaderboard[i].user_id})` : ""} - \`${`${currency_symbol} `}${prettify(leaderboard[i]["orderBySumValue"])}\`\n`;
            }
            else {
                str += `**#${trueIndex}:** ${(await interaction.client.users.fetch(leaderboard[i].user_id)).tag}${showIds ? ` (${leaderboard[i].user_id})` : ""} - \`${`${currency_symbol} `}${prettify(leaderboard[i]["orderBySumValue"])}\`\n`;
            }
        }
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Donation Leaderboard`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setColor('#cfad25')
                    .setDescription(str.trimEnd())
                    .setTimestamp()
            ]
        });
    }
}
//# sourceMappingURL=leaderboard.js.map