import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Guild, GuildMember, MessageEmbed, Permissions, Role, TextChannel } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";

export const slashCommand = new SlashCommandBuilder()
    .setName("reach")
    .setDescription("Polly's counterpart of Shero's reach command.")
    .addChannelOption(o => o.setName("channel").setDescription("The channel to check the reach of.").setRequired(true))
    .addStringOption(o => o.setName("roles").setDescription("The roles to check the reach of. Split role names/IDs with ','.").setRequired(true))

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 15 }),
    serverOnly: true,
    botPermissions: [Permissions.FLAGS.MANAGE_ROLES]
})

export async function execute(i: CommandInteraction) {
    // TODO: add body
    await i.deferReply({ ephemeral: true })
    let roles: Role[]

    try { roles = await parseRoleString(i.options.getString("roles"), i.guild) }
    catch (err) {
        await i.editReply({ content: `Failed to parse role list! (${err.message})` })
        return
    }

    const stats: Map<string, { roleMembers: GuildMember[], reachableMembers: GuildMember[], id: string, name: string }> = new Map()
    let channel = i.options.getChannel("channel")

    if (channel !instanceof TextChannel) channel = await i.guild.channels.fetch(channel.id)

    for (const role of roles) {
        if ((role as any) == 'here') {
            // here ping handling
            const members = (await i.guild.members.fetch()).filter(m => m.presence && m.presence.status != 'offline')
            const insEntry = { roleMembers: [], reachableMembers: [], id: "@here", name: "@here" }

            for (const member of members.values()) {
                insEntry.roleMembers.push(member)
                if (!member.user.bot && (channel as TextChannel).permissionsFor(member).has(Permissions.FLAGS.VIEW_CHANNEL)) {
                    insEntry.reachableMembers.push(member)
                }
            }

            stats.set('@here', insEntry)
        } else {
            const insEntry = { roleMembers: role.members.values() as any, reachableMembers: [], id: role.id, name: role.name }

            const rmArr = []
            for (const m of role.members.values()) {
                rmArr.push(m)
            }
            insEntry.roleMembers = rmArr

            role.members.forEach(m => {
                // perm check
                if (!m.user.bot && (channel as TextChannel).permissionsFor(m).has(Permissions.FLAGS.VIEW_CHANNEL)) {
                    insEntry.reachableMembers.push(m)
                }
            })
            stats.set(role.name, insEntry)
        }
    }

    // filter out duplicate members
    const cumulativeMembers = { raw: [], reachable: [] }

    for (const ent of stats) {
        for (const m of ent[1].reachableMembers) {
            if (!cumulativeMembers.reachable.includes(m.id)) cumulativeMembers.reachable.push(m.id)
        }

        for (const m of ent[1].roleMembers) {
            if (!cumulativeMembers.raw.includes(m.id)) cumulativeMembers.raw.push(m.id)
        }
    }

    // construct embed
    const emb = new MessageEmbed()
        .setTitle("Role Reaches")
        .setTimestamp()
        .setColor('#11c284')

    let description = `Channel: <#${channel.id}> (\`${channel.id}\`)\n`
    for (const stat of stats) {
        description += `\n⤕ ${stat[0]} (\`${stat[1].id}\`)\n**Total Members:** ${stat[1].roleMembers.length}\n**Reachable:** ${stat[1].reachableMembers.length} (${Math.round((stat[1].reachableMembers.length / stat[1].roleMembers.length) * 100)}%)`
    }

    description += `\n\n**Total Reach**\n${cumulativeMembers.reachable.length} out of ${cumulativeMembers.raw.length} members (${Math.round((cumulativeMembers.reachable.length / cumulativeMembers.raw.length) * 100)}%)`

    emb.setDescription(description)

    await i.editReply({ embeds: [emb] })
}

async function parseRoleString(rawArgs: string, guild: Guild): Promise<Role[]> {
    const argPassedRoles = [], guildRoles = await guild.roles.fetch()
    const args = rawArgs.split(/, |,/g)
    const returnRoles: Role[] = []
    if (args.length > 10) throw new Error("Too many roles to look through! Please limit the amount of roles to `10` or less.")

    for (const role of args) {
        if (isNaN(parseInt(role))) {
            // treat as role name
            const matchTolerance = 0.85, loweredRole = role.toLowerCase()
            let found = false

            if (loweredRole == "here" && !returnRoles.includes("here" as any)) {
                returnRoles.push("here" as any)
            } else if (loweredRole == "everyone") {
                returnRoles.push(guild.roles.everyone)
            } else {
                for (const guildRole of guildRoles.values()) {
                    if (similarity(loweredRole, guildRole.name.toLowerCase()) >= matchTolerance) {
                        if (!returnRoles.includes(guildRole)) returnRoles.push(guildRole)
                        found = true
                        break
                    }
                }
    
                if (!found) throw new Error(`There is no role under the name of "${role}"!`)
            }
        } else {
            // treat as role ID
            if (!guildRoles.has(role)) throw new Error(`Role ${role} is not a valid role ID!`)
            const rle = guildRoles.get(role)

            if (!returnRoles.includes(rle)) returnRoles.push(rle)
        }
    }

    return returnRoles
}

function editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function similarity(s1: string, s2: string) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength as any);
  }