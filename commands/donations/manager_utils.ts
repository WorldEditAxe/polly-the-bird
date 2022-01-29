import { SlashCommandBuilder } from "@discordjs/builders"
import { randomUUID } from "crypto"
import { Client, ColorResolvable, CommandInteraction, Guild, GuildMember, InteractionCollector, MessageActionRow, MessageButton, MessageEmbed, Permissions, User } from "discord.js"
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js"
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js"
import * as donos from "./donoDb.js"

const wipeConf: Array<number> = new Array<number>()
const embedColor: ColorResolvable = '#f5cb42'

export const preprocessorOptions = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 }),
    serverOnly: true,
    saveCooldownInDb: true
})

export const slashCommand = new SlashCommandBuilder()
    .setName("donations")
    .setDescription("Manage donations.")

    // Update Subcommand
    .addSubcommand(sub => sub
        // Set Subcommands Name
        .setName('update')
        .setDescription('Update a user\'s donations')

        .addStringOption(opt => opt
            .addChoice('add', 'add')
            .addChoice('remove', 'remove')
            .addChoice('set', 'set')

            .setName('action')
            .setDescription('Chose the action you want to carry onto the user\'s donations')
            .setRequired(true))

        .addStringOption(opt => opt
            .addChoice('giveaways', "GIVEAWAYS")
            .addChoice('heists', "HEISTS")
            .addChoice('events', "EVENTS")
            .addChoice('special', "SPECIAL")
            .addChoice('money', "MONEY")

            .setName('type')
            .setDescription('The type of donation you would like to change')
            .setRequired(true))

        .addUserOption(opt => opt
            .setName('user')
            .setDescription('Chose the user you want to update donations')
            .setRequired(true))

        .addIntegerOption(opt => opt
            .setName('amount')
            .setDescription('The amount of donations you would like to add/remove/set to the provided user')
            .setRequired(true)))

    // Wipe User
    .addSubcommand(sub => sub
        .setName("wipeuser")
        .setDescription("Wipe a user's donations.")

        .addUserOption(usr => usr
            .setName("user")
            .setDescription("The user to wipe.")
            .setRequired(true)))

export async function execute(interaction: CommandInteraction, client: Client) {
    // cache user if not in cache
    if (!interaction.guild) {
        await interaction.reply({ content: "This command is guild-only.", ephemeral: true })
        return
    }
    
    // Chache user if not already
    let m: GuildMember
    if (interaction.inCachedGuild()) {
        m = interaction.member
    } else {
        m = await (await interaction.guild.fetch()).members.fetch(interaction.user)
    }

    // mandatory auto init
    const dono = await donos.fetchDonos(interaction.options.getUser('user').id)

    switch(interaction.options.getSubcommand()) {
        case 'update':
            // check for permissions
            if (!hasPerms(m, interaction.options.getString('type') as any)) {
                await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true })
            } else {
                await interaction.deferReply()
                switch(interaction.options.getString('action')) {
                    case 'add':
                        await donos.addTo(interaction.options.getUser('user').id, interaction.options.getString('type') as any, interaction.options.getInteger('amount'), m.id)
                        const newAmount = dono[interaction.options.getString('type').toLowerCase()] + interaction.options.getInteger('amount')
                        const emb = new MessageEmbed()
                            .setTitle(`Updated Donations`)
                            .setDescription(`${interaction.options.getUser('user').username}'s donations have been updated.`)
                            .addField("Type", `\`${interaction.options.getString('type').toLowerCase()}\``, true)
                            .setTimestamp()
                            .setColor(embedColor)
                        if (interaction.options.getString('type') == "MONEY") {
                            emb.addField("New Amount", `\`${donos.prettify(newAmount, true)}\``, true)
                        } else {
                            emb.addField("New Amount", `\`${donos.currency_symbol} ${donos.prettify(newAmount)}\``, true)
                        }
                        await interaction.editReply({ embeds: [ emb ] })
                        break
                    case 'remove':
                        await donos.takeFrom(interaction.options.getUser('user').id, interaction.options.getString('type') as any, interaction.options.getInteger('amount'), m.id)
                        const newAmount2 = dono[interaction.options.getString('type').toLowerCase()] - interaction.options.getInteger('amount')
                        const emb2 = new MessageEmbed()
                            .setTitle(`Updated Donations`)
                            .setDescription(`${interaction.options.getUser('user').username}'s donations have been updated.`)
                            .addField("Type", `\`${interaction.options.getString('type').toLowerCase()}\``, true)
                            .setTimestamp()
                            .setColor(embedColor)
                            if (interaction.options.getString('type') == "MONEY") {
                                emb2.addField("New Amount", `\`${donos.prettify(newAmount2, true)}\``, true)
                            } else {
                                emb2.addField("New Amount", `\`${donos.currency_symbol} ${donos.prettify(newAmount2)}\``, true)
                            }
                        await interaction.editReply({ embeds: [ emb2 ] })
                        break
                    case 'set':
                        await donos.setDono(interaction.options.getUser('user').id, interaction.options.getString('type') as any, interaction.options.getInteger('amount'), m.id)
                        const newAmount3 = interaction.options.getInteger('amount')
                        const emb3 = new MessageEmbed()
                            .setTitle(`Updated Donations`)
                            .setDescription(`${interaction.options.getUser('user').username}'s donations have been updated.`)
                            .addField("Type", `\`${interaction.options.getString('type').toLowerCase()}\``, true)
                            .setTimestamp()
                            .setColor(embedColor)
                            if (interaction.options.getString('type') == "MONEY") {
                                emb3.addField("New Amount", `\`${donos.prettify(newAmount3, true)}\``, true)
                            } else {
                                emb3.addField("New Amount", `\`${donos.currency_symbol} ${donos.prettify(newAmount3)}\``, true)
                            }
                        await interaction.editReply({ embeds: [ emb3 ] })
                        break
                }
            }
            break
        case 'wipeuser':
            // check for permissions
            if (!hasPerms(m, 'SPECIAL')) {
                await interaction.reply({ content: "You do not have permission to use this command." })
            } else {
                const yesId = randomUUID(), noId = randomUUID()

                await interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Action Pending')
                            .setColor('#f2ed26')
                            .setDescription(`Are you sure you would like to wipe the donations of <@${interaction.options.getUser('user').id}>?\n**This cannot be undone!**`)
                    ],

                    components: [
                        new MessageActionRow()
                            .addComponents(new MessageButton()
                                .setCustomId(yesId)
                                .setLabel('Yes')
                                .setStyle('DANGER'),
                                           new MessageButton()
                                .setCustomId(noId)
                                .setLabel('No')
                                .setStyle('SECONDARY'))
                    ]
                })
                
                let collector = interaction.channel.createMessageComponentCollector({ time: 30 * 1000, componentType: 'BUTTON' })

                collector.on('collect', async i => {
                    if (i.customId == yesId) {
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle('Action Confirmed')
                                    .setColor('#18ff0d')
                                    .setDescription(`Are you sure you would like to wipe the donations of <@${interaction.options.getUser('user').id}>?\n**This cannot be undone!**`)
                            ],

                            components: [
                                new MessageActionRow()
                                .addComponents(new MessageButton()
                                    .setCustomId('yes u')
                                    .setLabel('Yes')
                                    .setStyle('PRIMARY')
                                    .setDisabled(true),
                                               new MessageButton()
                                    .setCustomId('no u')
                                    .setLabel('No')
                                    .setStyle('SECONDARY')
                                    .setDisabled(true))
                            ]
                        })

                        await i.deferReply()
                        await donos.deleteUser(interaction.options.getUser('user').id, m.id)
                        await i.editReply(`Successfully wiped user **${interaction.options.getUser('user').tag}**.`)
                    } else if (i.customId == noId) {
                        await interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle('Action Cancelled')
                                    .setColor('#ff5151')
                                    .setDescription(`Are you sure you would like to wipe the donations of <@${interaction.options.getUser('user').id}>?\n**This cannot be undone!**`)
                            ],

                            components: [
                                new MessageActionRow()
                                .addComponents(new MessageButton()
                                    .setCustomId('yes u')
                                    .setLabel('Yes')
                                    .setStyle('DANGER')
                                    .setDisabled(true),
                                               new MessageButton()
                                    .setCustomId('no u')
                                    .setLabel('No')
                                    .setStyle('SECONDARY')
                                    .setDisabled(true))
                            ]
                        })

                        await i.reply(`Cancelled action. Dodged a bullet there, phew.`)
                    }
                })
            }
            break
    }
}

function hasPerms(user: GuildMember, type: 'GIVEAWAYS' | 'HEISTS' | 'EVENTS' | 'SPECIAL' | 'MONEY'): boolean {
    if (user.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return true

    switch(type) {
        default:
            return user.roles.cache.has('785198646731604008') || user.roles.cache.has('785631914010214410') || user.roles.cache.has('791516116710064159')
        case 'GIVEAWAYS':
            return user.roles.cache.has('785198646731604008')
        case 'HEISTS':
            return user.roles.cache.has('785631914010214410')
        case 'EVENTS':
            return user.roles.cache.has('791516116710064159')
    }
}