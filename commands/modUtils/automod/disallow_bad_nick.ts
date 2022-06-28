import { Client, MessageEmbed } from "discord.js";
import * as decancer from "decancer"
import { compareTwoStrings } from "string-similarity";

const client: Client = global.bot.djsClient
const disallowedPhrases = [
    'nigga',
    'nigger',
    'niger',
    'badname'
]
const dc = decancer as any
const nickChangeTol = 0.75
const badNickTol = 0.65

function getOnlyCharacterAndNumberForm(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, "")
}

// block disallowed usernames
client.on('guildMemberAdd', async member => {
    const dced = dc.default(member.user.username)
    const hasBadNick = disallowedPhrases.some(phrase => compareTwoStrings(dced, phrase) > badNickTol)
    if (hasBadNick) {
        if (member.kickable) {
            await member.createDM().catch(() => {})
            await member.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Bad Username")
                        .setColor('RED')
                        .setDescription("You've been disallowed from entering the server due to a bad username. Until it is changed, you are not allowed to join the server,\nWhen you are done, please [join back](https://discord.gg/zsR6QpXYRj).")
                        .setFooter({ text: "Automated Action" })
                        .setTimestamp()
                ]
            }).catch(() => {})
            await member.kick(`Bad phrase found in username ${member.user.username} | Automated action.`).catch(() => {})
        }
    } else {
        if (compareTwoStrings(member.user.username, dced) > nickChangeTol && member.moderatable) {
            if (getOnlyCharacterAndNumberForm(dced).length <= 0) {
                await member.setNickname("simp name", "Decancered username.").catch(() => {})
            } else {
                await member.setNickname(dced, "Decancered username.").catch(() => {})
            }
        }
    }
})