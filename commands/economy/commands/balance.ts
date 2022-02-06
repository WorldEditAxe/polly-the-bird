import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Guild, GuildMember, MessageEmbed } from "discord.js";
import { coinSymbol, fetchInventory, prettify } from "../internal/economy.js";

export const slashCommand = new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance, or someone else's")
    .addUserOption(o => o.setName("user").setDescription("The person's balance to check").setRequired(false))

export async function execute(i: CommandInteraction) {
    await i.deferReply()

    const usr = (i.options.getMember("user") ? i.options.getMember("user") : i.member) as GuildMember
    const inv = await fetchInventory(usr.user.id)

    await i.editReply({ embeds: [
        new MessageEmbed()
            .setTitle(`${usr.displayName}${usr.displayName.endsWith("s") ? "'" : "'s"} balance`)
            .addField("Wallet", `\`${coinSymbol} ${prettify(inv.wallet_balance)}\``, true)
            .addField("Bank", `\`${coinSymbol} ${prettify(inv.bank_balance)}\``, true)
            .setColor('#c1de1f')
            .setFooter("based")
            .setTimestamp()
    ] })
}