import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { Item } from "../internal/dbInterfaces/objects/ItemInterface.js";
import { awaitLoad, coinSymbol, commandItemResolve, events, fetchAbstractInventory, fetchInventory, fetchItemOptionMappings, itemMisspellAutocorrect, items, prettify, resolveItem } from "../internal/economy.js";
import { fetchItemString } from "../internal/economyUtils.js";

await awaitLoad()

export const slashCommand = new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Shows the shop")
    .addSubcommand(s => s
        .setName("buy").setDescription("Buys an item from the shop")
        .addStringOption(o => o.setName("item").setRequired(true).setDescription("The item to buy").addChoices(fetchItemOptionMappings()))
        .addIntegerOption(o => o.setName("amount").setRequired(false).setDescription("The amount of the item to buy")))
    .addSubcommand(s => s
        .setName("sell").setDescription("Sells an item to the shop")
        .addStringOption(o => o.setName("item").setRequired(true).setDescription("The item to sell").addChoices(fetchItemOptionMappings()))
        .addIntegerOption(o => o.setName("amount").setRequired(false).setDescription("The amount of the item to sell")))
    .addSubcommand(s => s
        .setName("info").setDescription("Lists information about an item in the shop")
        .addStringOption(o => o.setName("item").setRequired(true).setDescription("The item to list information about").addChoices(fetchItemOptionMappings())))
    .addSubcommand(s => s
        .setName("list").setDescription("Lists all items in the shop")
        .addIntegerOption(o => o.setName("page").setRequired(false).setDescription("The page to list")))
    
const pageCache = new Array<MessageEmbed>();

export async function execute(i: CommandInteraction) {
    return await i.reply({ content: "Command disabled!", ephemeral: true })
    let item
    let count

    if (i.options.getSubcommand() == 'buy' || i.options.getSubcommand() == 'sell' || i.options.getSubcommand() == 'info') {
        item = commandItemResolve(i.options.getString('item'))
    } else { item = null }

    if (i.options.getSubcommand() == 'buy' || i.options.getSubcommand() == 'sell') {
        count = i.options.getInteger("amount") || 1
    } else { count = null }

    if (item == undefined) {
        const res = itemMisspellAutocorrect(i.options.getString("item"))
        return await i.reply({ content: `Invalid item name!${res ? `\nDid you mean **${res}**?` : ""}`, ephemeral: true })
    }

    const inv = fetchAbstractInventory(await fetchInventory(i.user.id))

    switch(i.options.getSubcommand()) {
        case "buy":
            if (!item.purchasable) return await i.reply({ content: `You cannot buy this item!`, ephemeral: true })
            if (count < 1) return i.reply("You need to provide an amount more than 0, sorry not sorry")
            if (count > 100000) return i.reply("You can only buy up to 100000 items at a time, sorry not sorry")
            if (await inv.getWalletBalance() < item.price * count) return await i.reply({ content: `You don't have enough money to buy ${count} ${fetchItemString(item)}!`, ephemeral: true })
            
            await inv.removeFromWalletBalance(item.price * count)
            await inv.giveItem(item, count)

            await i.reply({ embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setDescription(`Brought x${count} ${fetchItemString(item)} for \`${coinSymbol} ${prettify(item.price * count)}\` coins!`)
                    .setFooter(`Item count: ${await inv.getItemCount(item)}`)
                    .setTimestamp()
            ]})
            break
        case "sell":
            if (!item.sellable) return await i.reply({ content: `You cannot sell this item!`, ephemeral: true })
            if (count < 1) return i.reply("You need to provide an amount more than 0, sorry not sorry")
            if (count > 100000) return i.reply("You can only sell up to 100000 items at a time, sorry not sorry")
            if (await inv.getItemCount(item) < count) return await i.reply({ content: `You don't have enough of this item to sell. What ya gonna sell, the air??`, ephemeral: true })

            await inv.takeItem(item, count)
            await inv.addToWalletBalance(item.price * count)

            await i.reply({ embeds: [
                new MessageEmbed()
                    .setTitle("Success")
                    .setColor('#66d962')
                    .setDescription(`Sold x${count} ${fetchItemString(item)} for \`${coinSymbol} ${prettify(item.price * count)}\` coins!`)
                    .setFooter(`Item count: ${await inv.getItemCount(item)}`)
                    .setTimestamp()
            ]})
            break
        case "info":
            const cnt = await inv.getItemCount(item)

            await i.reply({ embeds: [
                new MessageEmbed()
                    .setTitle(item.name)
                    .setDescription(`${fetchItemString(item)} **-** ${item.description}`)
                    .addField("Buy Price", item.purchasable ? `\`${coinSymbol} ${prettify(item.price)}\`` : "Cannot be brought", true)
                    .addField("Sell Price", item.sellable ? `\`${coinSymbol} ${prettify(item.sellPrice)}\`` : "Cannot be sold", true)
                    .addField("Usable", item.usable ? "Yes" : "No", true)
                    .addField("Amount Owned", `\`x${prettify(cnt)}\``)
                    .setFooter(cnt > 0 ? `very based` : "imagine not having this smfh")
                    .setColor('#ebe48a')
            ]})
            break
        case "list":
            const page = i.options.getInteger("page") || 1
            if (page - 1 > pageCache.length || page - 1 < 1) return await i.reply({ content: `Invalid page! Valid inputs: 1-${pageCache.length}`, ephemeral: true })

            await i.reply({ embeds: [pageCache[page - 1]] })
            break
    }
}

function genPages() {
    let items: Array<Item> = new Array<Item>()
    const iReg = items

    iReg.forEach(v => items.push(v))
    let descStr = "Use `/shop info <itemName>` to get more information on an item.\nUse `/shop list [page]` to get a list of items.\n\n"
    let page = 1
    let totalCheckedItems = 0
    let checkedItems: number = 0
    let cembed = new MessageEmbed()
        .setTitle("Shop")
        .setColor('#ced854')
        .setDescription(descStr)

    // generate embed pages
    while (true) {
        checkedItems++
        totalCheckedItems++
        if (checkedItems > 5) {
            // regenerate the embed and restart the cycle
            checkedItems = 0
            cembed.setFooter(`Page ${page}`)
            pageCache.push(cembed)
            // regen
            cembed = new MessageEmbed()
                .setTitle("Shop")
                .setColor('#ced854')
        }

        if (totalCheckedItems > items.length) {
            if (Math.floor(totalCheckedItems / 5) != totalCheckedItems) {
                cembed.setFooter(`Page ${page}`)
                pageCache.push(cembed)
                // regen
                cembed = new MessageEmbed()
                    .setTitle("Shop")
                    .setColor('#ced854')
            }
            return
        }

        // retrieve the item and insert it into the embed
        const item = items[totalCheckedItems - 1]
        if (item["internal"] != true) continue
        if (!item.purchasable) {
            cembed.setDescription(cembed.description + `**${item.emoji} ${item.name}**\n${item.description}\n\n`)
        } else if (!item.sellable || !item.purchasable) {
            cembed.setDescription(cembed.description + `*${item.emoji} ${item.name}* - \`${coinSymbol} ${prettify(item.price)}\`\n${item.description}\n\n`)
        } else if (item.purchasable && item.sellable) {
            cembed.setDescription(cembed.description + `**${item.emoji} ${item.name}** - \`${coinSymbol} ${prettify(item.price)}\`\n${item.description}\n\n`)
        }
        
    }

}

export function staticBlock() {
    genPages()
}