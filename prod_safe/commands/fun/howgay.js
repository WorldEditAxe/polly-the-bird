import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
export const slashCommand = new SlashCommandBuilder()
    .setName("howgay")
    .setDescription("you how gay")
    .addSubcommand(c => c
    .setName("me")
    .setDescription("Check how gay you or someone else is (100% reel).")
    .addUserOption(o => o
    .setName("user")
    .setDescription("Pass a user to check their gayness. If you're doing bets, please use /howgay bet.")))
    .addSubcommand(c => c
    .setName("bet")
    .setDescription("Compares the gayness between you and another person.")
    .addUserOption(o => o
    .setName("user")
    .setDescription("The user you're betting with.")
    .setRequired(true))
    .addStringOption(o => o
    .setName("win_condition")
    .setDescription("Sets the win condition of the game.")
    .addChoices([['Win Condition > Highest', 'HIGHEST'], ['Win Condition > Lowest', 'LOWEST']])
    .setRequired(true)));
export async function execute(i) {
    if (i.options.getSubcommand(true) == 'me') {
        const gayPercent = Math.round(Math.random() * 100), user = i.options.getUser('user');
        await i.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("totally reel gay machine (veri tru)")
                    .setColor('#da62b2')
                    .setDescription(`${user ? `**${user.username}** is` : "you are"} ${gayPercent}% gay 🏳️‍🌈`)
                    .setFooter({ text: gayPercent > 70 ? `${user ? "they" : "you"} such gay` : `${user ? "they" : "you"} such ungay` })
                    .setTimestamp()
            ]
        });
    }
    else {
        const user1 = i.user, user2 = i.options.getUser("user"), win_cond = i.options.getString("win_condition");
        const sb = new MessageEmbed()
            .setTitle("totally reel gay machine (veri tru)")
            .setColor('#da62b2')
            .setFooter({ text: `Bet type: ${win_cond == 'HIGHEST' ? "Highest" : "Lowest"}` })
            .setTimestamp();
        const p1gay = Math.round(Math.random() * 100), p2gay = Math.round(Math.random() * 100);
        sb.addFields([
            { name: `${user1.username}'s gayness`, value: `${p1gay}%`, inline: true },
            { name: `${user2.username}'s gayness`, value: `${p2gay}%`, inline: true }
        ]);
        if (win_cond == 'HIGHEST') {
            if (p1gay == p2gay) {
                sb.setDescription("Well... this is awkward. No one won, try again.");
            }
            else if (p1gay > p2gay) {
                sb.setDescription(`🏆 **${user1.username}** wins the bet!`);
            }
            else {
                sb.setDescription(`🏆 **${user2.username}** wins the bet!`);
            }
        }
        else {
            if (p1gay == p2gay) {
                sb.setDescription("Well... this is awkward. No one won, try again.");
            }
            else if (p2gay < p1gay) {
                sb.setDescription(`🏆 **${user2.username}** wins the bet!`);
            }
            else {
                sb.setDescription(`🏆 **${user1.username}** wins the bet!`);
            }
        }
        await i.reply({
            embeds: [sb]
        });
    }
}
//# sourceMappingURL=howgay.js.map