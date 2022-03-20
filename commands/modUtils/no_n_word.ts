import { Client, MessageEmbed } from "discord.js";

const bannedWords = [
    "nigger",
    "nigga",
    "nigglet",
    "n!gger",
    "n!gga",
    "n1gger",
    "n1gga",
    "nigg@",
    "n!gg@",
    "ngger",
    "nlgga"
]

const suicide = [
    "i want to commit suicide",
    "i want to go kill myself",
    "i want to die"
]

const client: Client = global.bot.djsClient

client.on('messageCreate', async m => {
    if (m.author.bot || !m.guild) return 
    const lowered = m.cleanContent.toLowerCase()

    for (const w of suicide) {
        if (lowered.includes(w)) {
            try { await m.delete() }
            catch {}

            try {
                await m.member.createDM()
                await m.member.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#cf2d2d')
                            .setAuthor({ name: "Suicide Prevention" })
                            .setDescription("We want to let you know that you're never alone. Please check the below for suicide prevention resources.")
                            .addFields(
                                { name: "United States Suicide Hotline", value: "[Suicide Prevention Hotline](https://suicidepreventionlifeline.org/)\nPhone Number: 1-800-273-8255" },
                                { name: "International Suicide Hotline", value: "[Suicide Prevention Hotlines](https://www.opencounseling.com/suicide-hotlines)\nThis is for those that do not currently reside (live) in the US. Look up and call the suicide prevention hotline for your country." }
                            )
                    ],
                    content: `<@${m.author.id}>`
                })

                return
            } catch {}
        }
    }

    for (const w of bannedWords) {
        if (lowered.includes(w)) {
            try { await m.delete() }
            catch {}

            try {
                if (m.member.bannable) {
                    try {
                        await m.member.createDM()
                        await m.member.send({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('RED')
                                    .setTitle("Uh oh!")
                                    .setDescription(`You were banned for using a banned phrase in your message: ${w}. If you believe this is in error, please join the support server at https://discord.gg/4YgdCPmWvM.`)
                                    .setTimestamp()    
                            ]
                        })
                    } catch {}
                    await m.member.ban({ reason: "Banned phrase usage found in message | Automated action.", days: 1 })
                }

                return
            } catch {}
        }
    }
})