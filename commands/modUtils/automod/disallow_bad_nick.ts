import { Client, MessageEmbed } from "discord.js";
import { lockDown } from "../lockdown.js";
import { cleanString, getCleanForm, isStringDirty, isStringOffensive, logModerationAction } from "./automod_utils.js"

const client: Client = global.bot.djsClient
const disallowed = [
    'hitler',
    'nazi',
    'shit',
    'fuck',
    'bitch',
    'faggot',
    'retard',
    'cunt'
]
const GUILD_ID = '784491141022220309'

// block disallowed usernames
client.on('guildMemberAdd', async member => {
    if (lockDown) return
    if (isStringDirty(member.user.username, disallowed) && member.kickable) {
        await member.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Bad Username")
                    .setColor('#db3434')
                    .setDescription(`Your current username (\`${member.user.username}\`) is offensive, and as a result you are temporarily unable to join the server. Please remove objectionable content from your username and [try again](https://discord.gg/zsR6QpXYRj).`)
                    .setTimestamp()
            ]
        }).catch(() => {})
        await member.kick("Username contains objectionable content | Automated action.")
        await logModerationAction("Join Blocked", member.user, "Objectionable content detected in nickname.", undefined, [{
            name: "Tag", value: `**${member.user.tag}** (\`${member.user.id}\`)`, inline: true
        }])
        return
    }

    const cleaned = cleanString(member.user.username)
    if (cleaned != member.user.username && member.manageable) {
        await member.setNickname(getCleanForm(cleaned))
    }
})

client.on('guildMemberUpdate', async (ignore, member) => {
    if (!member.nickname) return
    const op = member.nickname
    if (isStringDirty(member.nickname, disallowed) && member.manageable) {
        await member.setNickname("Bad Nickname")
        await logModerationAction("Nickname Reset", member.user, "Nickname has objectionable content.", undefined, [{
            name: "Previous Nickname", value: op, inline: true
        }])
        return
    }
    const cleaned = cleanString(member.nickname, true)
    if (cleaned != member.nickname && member.manageable) {
        await member.setNickname(getCleanForm(cleaned))
        await logModerationAction("Decancered Nickname", member.user, "Nickname is cancerous.", undefined, [
            { name: "Previous Nickname", value: op, inline: true },
            { name: "New Nickname", value: member.nickname || "<none>", inline: true }
        ])
    }
})

client.on('userUpdate', async (ignore, user) => {
    if (isStringDirty(user.username)) {
        client.guilds.cache.get(GUILD_ID).members.fetch(user.id)
            .then(async member => {
                if (member.kickable) {
                    await member.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Bad Username")
                                .setColor('#db3434')
                                .setDescription(`Your current username (\`${member.user.username}\`) is offensive, and as a result you've been kicked from the server. Please remove objectionable content from your username and [join back](https://discord.gg/zsR6QpXYRj).`)
                                .setTimestamp()
                        ]
                    }).catch(() => {})
                    await member.kick("Username contains objectionable content | Automated action.")
                    await logModerationAction("Kick", user, "Bad Username", undefined)
                }
            })
            .catch(() => {})
    }
})