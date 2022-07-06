import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getErrorEmbed } from "../../embedGenerator.js";
import { ALLOWED_ROLES } from "./classes.js";
import { getUser } from "./db_wrapper.js";

type CommandType = 'remove' | 'info'

export const slashCommand = new SlashCommandBuilder()
    .setName("grants")
    .setDescription("Manage member grants.")
    .addSubcommand(c => c
        .setName("remove")
        .setDescription("Remove a grant.")
        .addUserOption(o => o
            .setName("user")
            .setDescription("The user to remove grants from.")
            .setRequired(true)))
    .addSubcommand(c => c
        .setName("info")
        .setDescription("Get a list of grants a user is holding, or on a specific one.")
        .addUserOption(o => o
            .setName("user")
            .setDescription("The user currently holding the grant.")
            .setRequired(true))
        .addIntegerOption(c => c
            .setName("index")
            .setDescription("The entry # of the grant. ")))

export async function execute(i: CommandInteraction) {
    if (!i.guild) return
    i.member = i.member instanceof GuildMember ? i.member : await i.guild.members.fetch(i.user.id)
    if (!ALLOWED_ROLES.some(allowed => (i.member as GuildMember).roles.cache.has(allowed))) return await i.reply({ content: "You are not authorized to run this command.", ephemeral: true })
    const target = i.options.getUser('user'), dbEntry = target ? await getUser(target.id) : null

    switch(i.options.getSubcommand(true) as CommandType) {
        default:
            return await i.reply({ content: "Unknown subcommand!", ephemeral: true })
            break
        case 'remove':
            if (dbEntry.getGrants().length <= 0) return await i.reply({ embeds: [getErrorEmbed("That user does not have any removable grants!")], ephemeral: true })
             break
    }
}0