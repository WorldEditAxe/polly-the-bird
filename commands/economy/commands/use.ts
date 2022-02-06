import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { awaitLoad, commandItemResolve, fetchAbstractInventory, fetchInventory, fetchItemOptionMappings, itemMisspellAutocorrect, resolveItem } from "../internal/economy.js";

await awaitLoad()

export const slashCommand = new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use an item")
    .addStringOption(o => o.setName("item").setRequired(true).setDescription("The item to use").addChoices(fetchItemOptionMappings()))
    .addIntegerOption(o => o.setName("amount").setRequired(false).setDescription("The amount of the item to use"))

export async function execute(i: CommandInteraction) {
    return await i.reply({ content: "Command disabled!", ephemeral: true })
    const count = i.options.getInteger("amount") || 1, item = commandItemResolve(i.options.getString("item"))
    if (!item) {
        const res = itemMisspellAutocorrect(i.options.getString("item"))
        return await i.reply({ content: `Invalid item name!${res ? `\nDid you mean **${res}**?` : ""}`, ephemeral: true })
    }

    if (item["internal"] == true) return await i.reply({ content: `You cannot use this item!`, ephemeral: true })
    
    const inv = fetchAbstractInventory(await fetchInventory(i.user.id))

    if (await inv.getItemCount(item) < count) return await i.reply("You don't have that many of that item lmao, how ya gonna use nothing")
    if (count < 1) return await i.reply("You need to provide a number over 0, sorry not sorry")
    
    
    if (await item.onUsed(i, i.user, item, count)) { await inv.takeItem(item, count) }
}