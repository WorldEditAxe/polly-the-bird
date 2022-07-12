import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
export const slashCommand = new SlashCommandBuilder()
    .setName("pp")
    .setDescription("see how long your (or someone else's) pp is ")
    .addSubcommand(c => c
    .setName("me")
    .setDescription("See how long your (or someone else's) pp is.")
    .addUserOption(o => o
    .setName("user")
    .setDescription("Pass a user here to see their PP length, or don't to see yours.")))
    .addSubcommand(c => c
    .setName("compare")
    .setDescription("Compare your and someone else's pp length.")
    .addUserOption(o => o
    .setName("user")
    .setDescription("The person to compare PP lengths with.")
    .setRequired(true)));
export async function execute(i) {
    if (i.options.getSubcommand() == 'me') {
        const user = i.options.getUser('user');
        const ppLength = Math.floor(Math.random() * (10 - 1) + 1), pp = `8${'='.repeat(ppLength)}D`;
        await i.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("pp length machine (100 peecent reel)")
                    .setColor('#47a0bb')
                    .setDescription(`${user ? user.username : "your"} pp:\n${pp}`)
                    .setFooter(ppLength > 5 ? "dang nice" : "short pp L")
                    .setTimestamp()
            ]
        });
    }
    else {
        const usr1 = i.user, usr2 = i.options.getUser('user');
        const length1 = Math.floor(Math.random() * (10 - 1) + 1), length2 = Math.floor(Math.random() * (10 - 1) + 1);
        const emb = new MessageEmbed()
            .setTitle("pp length machine (100 peecent reel)")
            .setColor('#47a0bb')
            .setTimestamp()
            .addFields([
            { name: `${usr1.username}'s pp [${length1}]`, value: `8${'='.repeat(length1)}D`, inline: true },
            { name: `${usr2.username}'s pp [${length2}]`, value: `8${'='.repeat(length2)}D`, inline: true },
        ]);
        if (length1 == length2) {
            emb.setDescription("Well... this is awkward. No one won, try again.");
        }
        else {
            emb.setDescription(`🏆 **${length1 > length2 ? usr1.username : usr2.username}** has the longer pp!`);
        }
        await i.reply({
            embeds: [emb]
        });
    }
}
//# sourceMappingURL=pp.js.map