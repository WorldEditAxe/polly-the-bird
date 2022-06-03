import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { prettify } from "../donations/donoDb.js";
import { parseTimeString } from "../fun/timer/timerDb.js";

export const slashCommand = new SlashCommandBuilder()
    .setName('heistad')
    .setDescription('Get the heist ad of the server')
    .addIntegerOption(o => o.setName('heist_amount').setDescription("Sets the amount of the Dank Memer heist").setRequired(true))
    .addStringOption(o => o.setName('heist_time').setDescription('Sets when the heist should begin').setRequired(true))

export async function execute(i: CommandInteraction) {
    const heist_amt = i.options.getInteger('heist_amount')
    let time_str

    try {
        time_str = parseTimeString(i.options.getString('heist_time'))
    } catch (err) {
        return await i.reply({ content: `Error parsing time string: ${err}`, ephemeral: true })
    }

    await i.reply({
        content: "On mobile? Don't worry, we got you! Copy the message content!\n```\n"
            + `Dadvertise heist **__Dank Merchants__**\n**\n💸୨ ⨯ \`⏣ ${prettify(heist_amt)}\` (${shortenAmount(heist_amt)}) heist\n:timer:୨ ⨯  Starts <t:${Math.floor(Date.now() / 1000) + time_str}:R> in <#931590909500481538> **(🏦┃heist)**`
            + `\n:trophy:୨ ⨯ LOTS of massive giveaways ongoing! (crown, tros, bolts)`
            + `\n:game_die: ୨ ⨯  We have awesome grinder perks for only 2 million coins per day!`
            + `\n:money_mouth: ୨ ⨯  Daily 30 million heist everyday!**`
            + "\n`Invite link:` https://discord.gg/TA9twYKey3\n\`\`\`",
        embeds: [
            new MessageEmbed()
                .setColor('#dee036')
                .setTitle("Generated Heist Ad")
                .setDescription("Generated heist ad preview:\n" + `**__Dank Merchants__**\n**\n💸୨ ⨯ \`⏣ ${prettify(heist_amt)}\` (${shortenAmount(heist_amt)}) heist\n:timer:୨ ⨯  Starts <t:${Math.floor(Date.now() / 1000) + time_str}:R> in <#931590909500481538> **(🏦┃heist)**`
                                    + `\n:trophy:୨ ⨯ LOTS of massive giveaways ongoing! (crown, tros, bolts)`
                                    + `\n:game_die: ୨ ⨯  We have awesome grinder perks for only 2 million coins per day!`
                                    + `\n:money_mouth: ୨ ⨯  Daily 30 million heist everyday!**`
                                    + "\n`Invite link:` https://discord.gg/TA9twYKey3")
                .addField("Shero heist ad command", `\`\`\`\nDadvertise heist **__Dank Merchants__**\n**\n💸୨ ⨯ \`⏣ ${prettify(heist_amt)}\` (${shortenAmount(heist_amt)}) heist\n:timer:୨ ⨯  Starts <t:${Math.floor(Date.now() / 1000) + time_str}:R> in <#931590909500481538> **(🏦┃heist)**`
                        + `\n:trophy:୨ ⨯ LOTS of massive giveaways ongoing! (crown, tros, bolts)`
                        + `\n:game_die: ୨ ⨯  We have awesome grinder perks for only 2 million coins per day!`
                        + `\n:money_mouth: ୨ ⨯  Daily 30 million heist everyday!**`
                        + "\n`Invite link:` https://discord.gg/TA9twYKey3\n\`\`\`")
                .setTimestamp()
        ],
        ephemeral: true,
        allowedMentions: {}
    })
}

function shortenAmount(amt: number): string {
    const bil = amt / 1000000000, mil = amt / 1000000

    if (bil > 1 && Math.floor(bil) == bil) return `${bil} billion`
    else if (bil > 1) return `${bil.toFixed(2)} billion`
    else return `${Math.floor(mil) == mil ? mil : mil.toFixed(2)} million`
}