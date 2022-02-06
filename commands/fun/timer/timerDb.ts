import { Client, MessageEmbed, Permissions, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import { awaitStart, getGlobalPersistentDb } from "../../database.js";

let timerDb: Collection, queuedTimers = []
const client: Client = global.bot.djsClient

await awaitStart()
timerDb = (await getGlobalPersistentDb()).collection('timers')

export type timerSchema = {
    channelId: string,
    messageId: string,
    reason: string,
    runner: string,
    timeBegin: number,
    timeEnd: number
}

export async function deleteTimer(messageId: string) {
    if (queuedTimers.includes(messageId)) {
        delete queuedTimers[messageId]
    }

    await timerDb.deleteOne({ messageId: messageId })
}

export async function createTimer(timer: timerSchema) {
    await timerDb.insertOne(timer)
}

export async function fetchTimer(id: string): Promise<timerSchema> {
    return (await timerDb.findOne({ messageId: id }) as any) as timerSchema
}

async function timerCallback(timer: timerSchema) {
    if (!queuedTimers.includes(timer.messageId)) return
    delete queuedTimers[timer.messageId]
    const channel = await client.channels.fetch(timer.channelId).catch() as TextChannel, msg = await channel.messages.fetch(timer.messageId).catch()

    if (channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES) && msg) {
        await msg.edit({ embeds: [ msg.embeds[0].setColor('#000000').setDescription("Timer ended!") ] })

        await msg.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Timer Ended")
                    .setColor('#57cf51')
                    .setDescription(`The timer from <t:${timer.timeBegin}:R> for **${timer.reason}** has ended.`)
                    .setTimestamp()
            ],
            content: `<@${timer.runner}>`
        }).catch()
        await timerDb.deleteOne({ messageId: timer.messageId })
    } else if (channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.VIEW_CHANNEL)) {
        await msg.delete().catch()
    }
}

async function timerLoop() {
    while (true) {
        const instant = Date.now();
        (await timerDb.find({ timeBegin: { $lt: Math.floor(Date.now() / 1000) + 3600 } }).toArray()).forEach(v => {
            const timer = (v as unknown) as timerSchema
            if (!queuedTimers.includes(timer.messageId)) {
                queuedTimers.push(timer.messageId)
    
                if (timer.timeEnd * 1000 < instant) {
                    timerCallback(timer).catch()
                } else {
                    setTimeout(() => timerCallback(timer).catch(), Math.floor(timer.timeEnd * 1000 - instant))
                }
            }
        })

        await (() => new Promise<void>(res => setTimeout(res, 10000)))()
    }
}

timerLoop()

export function parseTimeString(str: string): number {
    if (!str || str.length == 0) throw new Error("String is empty! {6}")

    const splitted = str.split(/ /g, 5), has = []
    const endings = { y: 31536000, yrs: 31536000, yr: 31536000, years: 31536000,
                      mth: 2628000, months: 2628000, mths: 2628000, month: 2628000,
                      w: 604800, week: 604800, weeks: 604800,
                      d: 86400, day: 86400, days: 86400,
                      m: 60, min: 60, minute: 60, minutes: 60,
                    s: 1, seconds: 1, second: 1, sec: 1 }

    let emptyLen = 0

    splitted.forEach(v => {
        if (v.length == 0) emptyLen++
    })

    if (emptyLen == splitted.length) throw new Error("String only consists of whitespace! {5}")

    if (splitted.length == 1) {
        const regex = splitted[0].match(/\D/g)

        if (regex || parseInt(splitted[0]) == NaN) {
            let match: any = splitted[0].match(/[a-z]/g), multi, time: any = splitted[0].match(/\d/g)
            if (!match) throw new Error(`Cannot find any suffix at all! {0}`)
            
            match = match.join('')
            multi = endings[match]

             if (!multi) throw new Error(`Suffix not valid! {1} [suffix: ${match}]`)
             if (!time) throw new Error(`No number found! {2}`)

             const pTime = parseInt(time.join(''))
             if (pTime == Infinity) throw new Error(`Parsed integer is infinity! {3}`)
             if (pTime == NaN) throw new Error(`Parsed number is not a number! {4} [amount: ${time}]`)

             return pTime * multi
        }

        return parseInt(splitted[0])
    } else {
        let time = 0

        for (const seg of splitted) {
            if (seg.length > 0) {
                let regexMatch: any = seg.match(/[a-z]/g)

                if (!regexMatch) throw new Error(`Cannot find any ending at all! {0} [segment: ${splitted.indexOf(seg) + 1}]`)
                regexMatch = regexMatch.join('').toLowerCase()
    
                let match = endings[regexMatch], t: any = seg.match(/\d/g)
                if (!match) throw new Error(`Ending not valid! {1} [segment: ${splitted.indexOf(seg) + 1}, ending: ${regexMatch}]`)
                if (!t) throw new Error(`No number found! {2} [segment: ${splitted.indexOf(seg) + 1}]`)
                
                const pT = parseInt(t.join(''))
                if (pT == Infinity) throw new Error(`Parsed integer is infinity! {3}`)
                if (pT == NaN) throw new Error(`Parsed integer not a number! {4} [segment: ${splitted.indexOf(seg) + 1}, amount: ${t}]`)
    
                time += pT * match
            }
        }

        return time
    }
}