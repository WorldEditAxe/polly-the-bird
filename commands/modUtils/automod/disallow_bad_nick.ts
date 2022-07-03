import { Client, MessageEmbed } from "discord.js";
import { lockDown } from "../lockdown.js";
import { cleanString, getCleanForm, isStringDirty, isStringOffensive } from "./automod_utils.js"

const client: Client = global.bot.djsClient
const disallowed = [
    'hitler',
    'nazi'
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
        return
    }

    const cleaned = cleanString(member.user.username)
    if (cleaned != member.user.username && member.manageable) {
        await member.setNickname(getCleanForm(cleaned))
    }
})

client.on('guildMemberUpdate', async (ignore, member) => {
    if (!member.nickname) return
    if (isStringDirty(member.displayName, disallowed) && member.manageable) await member.setNickname("Bad Nickname")
    const cleaned = cleanString(member.nickname)
    if (cleaned != member.nickname && member.manageable) await member.setNickname(getCleanForm(cleaned))
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
                }
            })
            .catch(() => {})
    }
})