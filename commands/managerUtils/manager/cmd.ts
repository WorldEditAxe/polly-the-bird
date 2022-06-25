import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { getErrorEmbed } from "../../embedGenerator.js";
import { initManager, isUserManager, ManagerType } from "./db_wrapper.js";

const COMMAND_WHITELIST = {
    ROLES: [
        '784527745539375164', // moderator
        '789642191583838208', // s. mod
        '789642191521316884', // head mod
        '784492058756251669', // admin
        '788738305365114880', // co-owner

    ],
    USERS: [

    ]
}

function userAllowed(user: GuildMember): boolean {
    return COMMAND_WHITELIST.USERS.includes(user.id) || COMMAND_WHITELIST.ROLES.some(r => user.roles.cache.has(r))
}


type ActionType = 'add' | 'remove'

// TODO: work on when?
export const slashCommand = new SlashCommandBuilder()
    .setName("giveaways")
    .setDescription("Manage giveaway managers.")
    .addSubcommand(s => s
        .setName("add")
        .setDescription("Add a manager into Polly's logging system.")
        .addUserOption(u => u
            .setName("member")
            .setDescription("The member to enable logging on.")
            .setRequired(true))
        .addStringOption(o => o
            .setName("type")
            .setDescription("The type of manager to add the user as.")
            .addChoices([
                ['Event Manager', ManagerType.EVENTS],
                ['Giveaway Manager', ManagerType.GIVEAWAYS]
            ])))
    .addSubcommand(s => s
        .setName("remove")
        .setDescription("Remove a manager from Polly's logging system.")
        .addUserOption(u => u
            .setName("member")
            .setDescription("The member to disable logging on.")
            .setRequired(true))
        .addStringOption(o => o
            .setName("type")
            .setDescription("The type of manager to add the user as.")
            .addChoices([
                ['Event Manager', ManagerType.EVENTS],
                ['Giveaway Manager', ManagerType.GIVEAWAYS]
            ])))

export async function execute(i: CommandInteraction) {
    const member = i.guild ? i.member instanceof GuildMember ? i.member : await i.guild.members.fetch(i.member.user.id) : undefined
    if (!i.guild) return await i.reply({ content: "This command is guild-only!", ephemeral: true })
    if (i.guild.ownerId != i.user.id && !userAllowed(member)) return await i.reply({ content: "You do not have permission to run this command! If you believe this is in error, please contact an administrator." })
    const actionType: ActionType = i.options.getSubcommand(true) as any
    const managerType: ManagerType = i.options.getString("type") as any

    switch(actionType) {
        default:
            return await i.reply({
                embeds: [getErrorEmbed("Invalid subcommand passed!")],
                ephemeral: true
            })
            break
        case 'add':
            if (await isUserManager(i.user)) {
                return await i.reply({
                    embeds: [getErrorEmbed(`That user is already an manager of type ${managerType.toLowerCase()}!`)],
                    ephemeral: true
                })
            }
            await initManager(member.user, managerType)
            await 
    }
}