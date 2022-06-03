// POLLY!??

import { randomUUID } from "crypto";
import { Client, GuildChannel, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { get } from "https";
import { addCookies } from "./pollyDatabase.js";

const snooze = ms => new Promise(res => setTimeout(res, ms))
const sendChannel = '870193314413019216'
const timer = 240
const client: Client = global.bot.djsClient

export async function sayHiToPolly(channel: GuildChannel, ping?: boolean) {
    const chan = channel as TextChannel
    const id = 'polly_feed-' + randomUUID()
    const button = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId(id)
            .setEmoji('928484406266581003')
            .setStyle('SUCCESS')
    )
    const gaveCookies = new Array<string>()
    const collector = chan.createMessageComponentCollector({ componentType: 'BUTTON', time: 30000 })
    let cookies = 0

    
    await chan.sendTyping()
    const msg = await chan.send({ embeds: [
        new MessageEmbed()
            .setTitle("POLLY IS HUNGRY")
            .setColor('#fcba03')
            .setDescription("GIVE POLLY CRACKER OR ELSE <:polly:959033132282179644>")
            .setFooter(`Fun fact: ${await getFunFact()}`)
            .setTimestamp()
    ],
    content: ping ? "<@&784546863436005386>" : undefined,
    components: [button]
    })

    collector.on('collect', async i => {
        if (!i.customId.startsWith(id)) return
        if (gaveCookies.includes(i.user.id)) return await i.reply({ content: "Polly says one cracker per person >:(", ephemeral: true })

        cookies += 1
        await addCookies(i.user.id)
        await i.reply({ content: 'POLLY SAYS GOOD JOB AND CRACKER YUMMY', ephemeral: true })
        gaveCookies.push(i.user.id)
    })

    collector.on('end', async () => {
        try {
            if (cookies <= 0) await chan.send(`polly says 0 cracker too little. polly want feed!!!! POLLY WANT CRAFHEKER!!!11!1!`)
            else await chan.send(`Someone fed Polly, good job! Polly is happy and has ${cookies} cracker(s) :D`)
    
            await msg.edit({ embeds: [
                new MessageEmbed()
                    .setTitle('POLLY IS FULL')
                    .setColor('GREEN')
                    .setDescription(cookies > 0 ? `POLLY HAS BEEN FED AND NOW HAS ${cookies} CRACKER(S) <:polly:959033132282179644>`
                                                 : `POLLY HAS NO CRACKER. POLLY WANT CRACKER. <:polly:959033132282179644>`)
                    .setFooter('Give Polly more crackers or else')
                    .setTimestamp()
            ],
            components: [   
                new MessageActionRow()
                    .addComponents(new MessageButton()
                        .setCustomId(`no moar cracker`)
                        .setDisabled(true)
                        .setEmoji('928484406266581003')
                        .setStyle('SUCCESS')
                    )
            ]
            })
        } catch {  }
    })
}

async function loop() {
    while (true) {
        await sayHiToPolly(await client.channels.fetch(sendChannel) as any, false)
        await snooze(timer * 60 * 1000 + (randomFrom(0, 10) * 60 * 1000))
    }
}

function randomFrom(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

export async function staticBlock() {
    if (process.env.POLLY_DEVELOPMENT_MODE == 'true') return
    const client: Client = global.bot.djsClient

    // we need status
    client.user.setStatus('idle')
    client.user.setActivity({ name: 'general for crackers', type: 'COMPETING' })

    loop()
}

async function getFunFact(): Promise<string> {
    let rawData = ""

    await new Promise((resolve, rej) => {
        get("https://uselessfacts.jsph.pl/random.json?language=en", res => {
            if (res.statusCode != 200) rej("Status code not 200!")
            res.on('data', data => rawData += data)
            res.on('end', resolve)
            res.on('error', rej)
        })
    })

    return (JSON.parse(rawData)).text
}