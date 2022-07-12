import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
export const slashCommand = new SlashCommandBuilder()
    .setName('partnerinfo')
    .setDescription("Get our partner info");
export async function execute(i) {
    await i.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("Partner Information")
                .setColor('#dee036')
                .setThumbnail(i.guild.iconURL())
                .setDescription("Want to partner with us? Read the below information!")
                .addFields([
                { name: "Read before partnering!", value: "We are NOT accepting any partners from the servers FightHub or Supreme Dankers. Sorry!" },
                { name: "Requirements", value: "Before partnering with our server, please make sure your server falls under the below requirements.\n\n**1.** Server must have more than `500` members (__excluding bots__).\n**2.** Server must not be directed towards anything **NSFW**.\n**3.** Server must be Dank Memer oriented.\n**4.** Server must follow Discord's and Dank Memer's ToS (terms of service).\n**5.** Server must have rob and heist disabled." },
                { name: "How to apply", value: "We'd love to partner with your server! Please follow the below steps to get started.\n\n**1.** Check if your server meets our partnership requirements. They can be found in the above section \"Requirements\", or at <#870234410694373426>.\n**2.** DM an admin+ staff member **OR** a partnership manager. We will get back to you as soon as possible. Good luck applying!" }
            ])
                .setTimestamp()
        ]
    });
}
//# sourceMappingURL=partner_info.js.map