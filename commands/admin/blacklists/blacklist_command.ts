import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { CommandPreprocessor } from "../../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../../lib/preprocessor/cooldownDate.js";
import { parseTimeString } from "../../fun/timer/timerDb.js";
import { blacklistUser, getUserBlacklistDetails, unblacklistUser } from "./blacklist.js";

const whitelistedUsers = ['695353371535736944', '879849559046643793']

type subCommandTypings = 'info' | 'blacklist' | 'unblacklist'

export const slashCommand = new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Add and remove users to and from the user blacklist.")
    .addSubcommand(c => c.setName("info").setDescription("Look up blacklist information of a user.")
        .addUserOption(o => o.setName("target").setDescription("The user to view the blacklist information of.").setRequired(true)))
    .addSubcommand(c => c.setName("blacklist").setDescription("Blacklist a user.")
        .addUserOption(o => o.setName("target").setDescription("The user to blacklist.").setRequired(true))
        .addStringOption(o => o.setName("reason").setDescription("The reason for the blacklist.").setRequired(true))
        .addStringOption(o => o.setName("time").setDescription("How long the blacklist shall last (leave empty for indefinite).").setRequired(true))
        .addBooleanOption(o => o.setName('dm_user').setDescription("Whether or not should I DM the user.").setRequired(false)))
    .addSubcommand(c => c.setName("unblacklist").setDescription("Unblacklist a user.")
        .addUserOption(o => o.setName("target").setDescription("The user to unblacklist.").setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription("The reason to unblacklist the user.").setRequired(true))
        .addBooleanOption(o => o.setName('dm_user').setDescription("Whether or not should I DM the user.").setRequired(false)))

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 })
})

export const guildRegisterId = '939809816283611137'

export async function execute(i: CommandInteraction) {
    if (!whitelistedUsers.includes(i.user.id)) return await i.reply({ content: "You do not have the permission to run this command!", ephemeral: true })
    const target: User = await i.client.users.fetch(i.options.getUser("target")),
          reason = i.options.getSubcommand(true) == 'blacklist' || i.options.getSubcommand(true) == 'unblacklist'
                        ? i.options.getString("reason")
                        : undefined,
          time = i.options.getSubcommand(true) == 'blacklist'
                    ? i.options.getString("time")
                    : undefined,
          dmUser = i.options.getSubcommand(true) == 'blacklist' || i.options.getSubcommand(true) == 'unblacklist'
                    ? i.options.getBoolean("dm_user")
                    : true
    let sendEmbed: MessageEmbed

    switch (i.options.getSubcommand(true) as subCommandTypings) {
        default:
            await i.reply({ content: "I honestly have no idea how you got here but congrats ig", ephemeral: true })
            break

        case 'info':
            sendEmbed = new MessageEmbed()
            const banDetails = await getUserBlacklistDetails(target)

            if (banDetails.banned) {
                if (banDetails.expiry_time != 'infinity') {
                    if (banDetails.expiry_time > Math.floor(Date.now() / 1000)) {
                        sendEmbed
                            .setTitle(`${target.tag}'s Blacklist Status`)
                            .setColor('#f54242')
                            .setDescription("This user is blacklisted.")
                            .setTimestamp()
                            .addFields(
                                { name: "Blacklisted", value: "Yes", inline: true },
                                { name: "Reason", value: banDetails.reason, inline: true },
                                { name: "Expiry Date", value: `<t:${banDetails.expiry_time}> (<t:${banDetails.expiry_time}:R>)`, inline: true }
                            )
                    } else {
                        sendEmbed
                            .setTitle(`${target.tag}'s Blacklist Status`)
                            .setColor('#7cd435')
                            .setDescription("This user isn't blacklisted.")
                            .setTimestamp()
                    }
                } else {
                    sendEmbed
                        .setTitle(`${target.tag}'s Blacklist Status`)
                        .setColor('#f54242')
                        .setDescription("This user is blacklisted.")
                        .setTimestamp()
                        .addFields(
                            { name: "Blacklisted", value: "Yes", inline: true },
                            { name: "Reason", value: banDetails.reason, inline: true },
                            { name: "Expiry Date", value: "<indefinite>", inline: true }
                        )
                }
            } else {
                sendEmbed
                    .setTitle(`${target.tag}'s Blacklist Status`)
                    .setColor('#7cd435')
                    .setDescription("This user isn't blacklisted.")
                    .setTimestamp()
            }

            await i.reply({ embeds: [sendEmbed] })
            break
        case 'blacklist':
            if (reason && reason.length > 100) return await i.reply({ content: `Please limit the reason to be shorter than \`100\` characters.`, ephemeral: true })

            let parsedTime
            let failed: boolean = false

            if (time != 'infinity') {
                try {
                    parsedTime = parseTimeString(time) + Math.floor(Date.now() / 1000)
                } catch (err) {
                    return await i.reply({
                        embeds: [
                            new MessageEmbed()
                            .setColor('RED')
                            .setTimestamp()
                            .setDescription("**Unable to parse time string!**\n"
                                + (err as string).startsWith('Suffix not valid! {1}') || err == 'No number found! {2}'
                                    ? `*${err}*\n**Possible Solution**: Enter a properly formatted time (i.e. 1s, 5m 30s, 1d).`
                                    : `*${err}*`)
                        ],
                        ephemeral: true
                    })
                }
            } else { parsedTime = 'infinity' }

            let addedIntoDB: boolean = false, directMessaged: boolean = false

            try {
                await blacklistUser({
                    user_id: target.id,
                    reason: reason ? reason : `<no reason given>`,
                    expiry_time: parsedTime
                })

                addedIntoDB = true
            } catch (err) {
                return await i.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`**Failed to blacklist!**\nI was unable to blacklist the user!\nError: ${err}`)
                            .setColor('RED')
                            .setTimestamp()
                    ]
                })
            }

            if (dmUser) {
                try {
                    await target.createDM()
                    await target.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#000000')
                                .setTitle("You've been blacklisted!")
                                .setTimestamp()
                                .addFields(
                                    { name: "Moderator", value: `${i.user.tag} (${i.user.id})`, inline: true },
                                    { name: "Reason", value: reason, inline: true },
                                    { name: "Expiry Date", value: parsedTime == 'infinity' ? "<indefinite>" : `<t:${parsedTime}> (<t:${parsedTime}:R>)`, inline: true }
                                )
                        ]
                    })
                    directMessaged = true
                } catch (ignored) {}
            }

            // TODO: add unblacklist command, complete blacklist command
            await i.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`${addedIntoDB && (!dmUser || directMessaged) ? "Success" : "Error"}`)
                        .setColor(addedIntoDB && (!dmUser || directMessaged) ? '#1bcc38' : '#ed3e3e')
                        .setDescription(addedIntoDB && (!dmUser || directMessaged) ? "Successfully blacklisted user!" : "Failed to blacklist - check below breakdown.")
                        .addFields(
                            { name: "Updated Database", value: `${addedIntoDB ? ":white_check_mark: Yes" : ":x: No"}`, inline: true },
                            { name: "DMed User", value: `${directMessaged ? ":white_check_mark: Yes" : ":x: No"}`, inline: true }
                        )
                ]
            })
            
            break
        case 'unblacklist':
            let addedIntoDB1: boolean = false, directMessaged1: boolean = false

            try {
                await unblacklistUser(target)
                addedIntoDB1 = true
            } catch (err) {
                return await i.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`**Failed to unblacklist!**\nI was unable to unblacklist the user!\nError: ${err}`)
                            .setColor('RED')
                            .setTimestamp()
                    ]
                })
            }

            if (dmUser) {
                try {
                    await target.createDM()
                    await target.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Unblacklisted")
                                .setColor('#c2c22d')
                                .setTimestamp()
                                .addFields(
                                    { name: "Moderator", value: `${i.user.tag} (${i.user.id})`, inline: true },
                                    { name: "Reason", value: reason, inline: true }
                                )
                        ]
                    })
                    directMessaged1 = true
                } catch {}
            }

            await i.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`${addedIntoDB1 && (!dmUser || directMessaged1) ? "Success" : "Error"}`)
                        .setColor(addedIntoDB1 && (!dmUser || directMessaged1) ? '#1bcc38' : '#ed3e3e')
                        .setDescription(addedIntoDB1 && (!dmUser || directMessaged1) ? "Successfully unblacklisted user!" : "Failed to unblacklist - check below breakdown.")
                        .addFields(
                            { name: "Updated Database", value: `${addedIntoDB1 ? ":white_check_mark: Yes" : ":x: No"}`, inline: true },
                            { name: "DMed User", value: `${directMessaged1 ? ":white_check_mark: Yes" : ":x: No"}`, inline: true }
                        )
                ]
            })
            
            break
    }
}