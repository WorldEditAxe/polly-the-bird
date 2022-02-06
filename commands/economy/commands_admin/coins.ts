import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import { CommandPreprocessor } from "../../../lib/preprocessor/commandPreprocessor.js"
import { CooldownDate } from "../../../lib/preprocessor/cooldownDate.js"
import { coinSymbol, prettify } from "../internal/economy.js"
import { addToWallet, fetchWalletBalance, removeFromWallet, setWalletBalance } from "../internal/economyApi.js"

export const guildRegisterId = '939809816283611137'

export const commandPreprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 15 })
})

export const slashCommand = new SlashCommandBuilder()
    .setName('coins')
    .setDescription('Add, give or set someone\'s coins')
    .addSubcommand(c => c.setName('add').setDescription('Add to someone\'s coin balance')
        .addUserOption(o => o.setName('user').setDescription('Whom to change the balance of').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('How much to add to the user').setRequired(true)))

    .addSubcommand(c => c.setName('remove').setDescription('Take away from someone\'s coin balance')
        .addUserOption(o => o.setName('user').setDescription('Whom to change the balance of').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('How much to take from the user').setRequired(true)))

    .addSubcommand(c => c.setName('set').setDescription('Sets someone\'s coin balance')
        .addUserOption(o => o.setName('user').setDescription('Whom to set the balance of').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('How much coins the user should have').setRequired(true)))

export async function execute(i: CommandInteraction) {
    const action = i.options.getSubcommand(true)
    const usr = i.options.getUser('user')
    const amount = i.options.getInteger('amount')

    switch(action) {
        default:
            await i.reply({ content: "Invalid subcommand!", ephemeral: true })
            break
        case 'add':
            await i.deferReply()
            const bal = await fetchWalletBalance(usr.id)
            if (bal + amount > Number.MAX_SAFE_INTEGER || bal + amount < Number.MIN_SAFE_INTEGER) return await i.editReply("New amount above maximum safe integer amount!")
            
            await addToWallet(usr.id, amount)
            await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Success')
                        .setColor('#22a61e')
                        .addFields(
                            { name: "User", value: `${usr.tag} (ID: ${usr.id})`, inline: true },
                            { name: "Amount Added", value: `\`${coinSymbol} ${prettify(amount)}\``, inline: true },
                            { name: "New Amount", value: `\`${coinSymbol} ${prettify(amount + bal)}\``, inline: true }
                        )
                        .setTimestamp()
                ]
            })
            break

        case 'remove':
            await i.deferReply()
            const bal2 = await fetchWalletBalance(usr.id)
            if (bal2 - amount > Number.MAX_SAFE_INTEGER || bal2 - amount < Number.MIN_SAFE_INTEGER) return await i.editReply("New amount above maximum safe integer amount!")
            
            await removeFromWallet(usr.id, amount)
            await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Success')
                        .setColor('#22a61e')
                        .addFields(
                            { name: "User", value: `${usr.tag} (ID: ${usr.id})`, inline: true },
                            { name: "Amount Removed", value: `\`-${coinSymbol} ${prettify(amount)}\``, inline: true },
                            { name: "New Amount", value: `\`${coinSymbol} ${prettify(amount - bal2)}\``, inline: true }
                        )
                        .setTimestamp()
                ]
            })
            break

        case 'set':
            await i.deferReply()
            if (amount > Number.MAX_SAFE_INTEGER || amount < Number.MIN_SAFE_INTEGER) return await i.editReply("New amount above maximum safe integer amount!")
            
            await setWalletBalance(usr.id, amount)
            await i.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Success')
                        .setColor('#22a61e')
                        .addFields(
                            { name: "User", value: `${usr.tag} (ID: ${usr.id})`, inline: true },
                            { name: "New Amount", value: `\`${coinSymbol} ${prettify(amount)}\``, inline: true }
                        )
                        .setTimestamp()
                ]
            })
            break
    }
}