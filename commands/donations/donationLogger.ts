import { Client, MessageEmbed, TextChannel } from "discord.js";
import { currency_symbol, eventBindings, prettify } from "./donoDb.js";

const donations = eventBindings
const client: Client = global.bot.djsClient
const loggingChannel = '930324890471518278'
    , chan = await client.channels.fetch(loggingChannel) as TextChannel

donations.on('add', async (userId: string, type:  'GIVEAWAYS' | 'HEISTS' | 'EVENTS' | 'SPECIAL' | 'MONEY', amount: number, total: number, moderator: string) => {
    const target = await client.users.fetch(userId), mod = await client.users.fetch(moderator)

    try {
        await chan.send({ embeds: [
            new MessageEmbed()
                .setTitle('Donation Update')
                .setTimestamp()
                .setFooter(`Manager: ${mod.tag}`)
                .setColor(target.id == mod.id ? '#f00006' : '#fff422')
                .setDescription(target.id == mod.id ? `:warning: **SELF DONATION MODIFICATION** User modified their own donations, mad sus moment :warning:` : '')
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Manager', value: `${mod.tag} (${mod.id})`, inline: true },
                    { name: 'Action', value: 'Add', inline: true },
                    { name: 'Type', value: `\`${type.toLowerCase()}\``, inline: true },
                    { name: 'Amount', value: `\`${type == 'MONEY' ? '' : `${currency_symbol} `}${type == 'MONEY' ? prettify(amount, true) : prettify(amount)}\``, inline: true },
                    { name: 'New Amount', value: `\`${type == 'MONEY' ? '' : `${currency_symbol} `}${type == 'MONEY' ? prettify(total, true) : prettify(total)}\``, inline: true }
                )
        ] })
    } catch {}
})


donations.on('remove', async (userId: string, type:  'GIVEAWAYS' | 'HEISTS' | 'EVENTS' | 'SPECIAL' | 'MONEY', amount: number, total: number, moderator: string) => {
    const target = await client.users.fetch(userId), mod = await client.users.fetch(moderator)

    try {
        await chan.send({ embeds: [
            new MessageEmbed()
                .setTitle('Donation Update')
                .setTimestamp()
                .setFooter(`Manager: ${mod.tag}`)
                .setColor(target.id == mod.id ? '#f00006' : '#fff422')
                .setDescription(target.id == mod.id ? `:warning: **SELF DONATION MODIFICATION** User modified their own donations, mad sus moment :warning:` : '')
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Manager', value: `${mod.tag} (${mod.id})`, inline: true },
                    { name: 'Action', value: 'Remove', inline: true },
                    { name: 'Type', value: `\`${type.toLowerCase()}\``, inline: true },
                    { name: 'Amount', value: `\`${type == 'MONEY' ? '' : `${currency_symbol} `}${type == 'MONEY' ? prettify(amount, true) : prettify(amount)}\``, inline: true },
                    { name: 'New Amount', value: `\`${type == 'MONEY' ? '' : `${currency_symbol} `}${type == 'MONEY' ? prettify(total, true) : prettify(total)}\``, inline: true }
                )
        ] })
    } catch {}
})

donations.on('set', async (userId: string, type:  'GIVEAWAYS' | 'HEISTS' | 'EVENTS' | 'SPECIAL' | 'MONEY', amount: number, moderator: string) => {
    const target = await client.users.fetch(userId), mod = await client.users.fetch(moderator)

    try {
        await chan.send({ embeds: [
            new MessageEmbed()
                .setTitle('Donation Update')
                .setTimestamp()
                .setFooter(`Manager: ${mod.tag}`)
                .setColor(target.id == mod.id ? '#f00006' : '#fff422')
                .setDescription(target.id == mod.id ? `:warning: **SELF DONATION MODIFICATION** User modified their own donations, mad sus moment :warning:` : '')
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Manager', value: `${mod.tag} (${mod.id})`, inline: true },
                    { name: 'Action', value: 'Set', inline: true },
                    { name: 'Type', value: `\`${type.toLowerCase()}\``, inline: true },
                    { name: 'Amount/New Amount', value: `\`${type == 'MONEY' ? '' : `${currency_symbol} `}${type == 'MONEY' ? prettify(amount, true) : prettify(amount)}\``, inline: true }
                )
        ] })
    } catch {}
})

donations.on('delete', async (userId: string, moderator: string) => {
    const target = await client.users.fetch(userId), mod = await client.users.fetch(moderator)

    try {
        await chan.send({ embeds: [
            new MessageEmbed()
                .setTitle('Donation Update')
                .setTimestamp()
                .setFooter(`Manager: ${mod.tag}`)
                .setColor(target.id == mod.id ? '#f00006' : '#fff422')
                .setDescription(target.id == mod.id ? `:warning: **SELF DONATION MODIFICATION** User modified their own donations, mad sus moment :warning:` : '')
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Manager', value: `${mod.tag} (${mod.id})`, inline: true },
                    { name: 'Action', value: 'Delete/Wipe User', inline: true }
                )
        ] })
    } catch {}
})