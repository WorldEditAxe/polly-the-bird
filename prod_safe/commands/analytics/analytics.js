/*
    import { Client, MessageEmbed, WebhookClient } from "discord.js";
import { awaitStart, getGlobalPersistentDb } from "../database.js";

await awaitStart()

const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/961862432517652501/fI2zSlPgcMKohjaf-1iHnWtETp18iI4l3XWhyahhisrk6ngXRJhU-6VLyE_aR1ozO4d2" })
const dbCon = (await getGlobalPersistentDb()).collection("reports")
const dbCon_dayStart = (await getGlobalPersistentDb()).collection("dayStarts")
const client = global.bot.djsClient as Client
const guild = "784491141022220309"

// temp vars
let tempTime = Math.floor(Date.now() / 1000)
let tempJoinCount = 0
let tempLeaveCount = 0

type schema$dailyReport = {
    day: number,
    notes?: string,
    member_peak_count: number,
    member_peak_time: number,
    member_joined_count: number,
    member_left_count: number,
    start_of_day_member_count: number
}

type schema$hourlyReport = {
    tod: number,
    member_online_count: number,
    member_offline_count: number,
    member_count: number,
    member_joined_count: number,
    member_left_count: number
}

type schema$weeklyReport = {
    date: {
        year: number,
        month: number,
        day: number,
        unix: number
    },
    best_day: schema$dailyReport
}

type schema$dayStart = {
    day: number,
    member_count: number
}

// event handling cbs
async function memberJoinCb() {
    tempJoinCount += 1
}

async function memberLeaveCb() {
    tempLeaveCount -= 1
}

// TODO: finish

async function hourPassedCb(postStatus?: boolean) {
    const mbr = (await (await client.guilds.fetch(guild)).members.fetch())
    let onlineCount = 0, offlineCount = 0
    mbr.forEach(mbr => {
        if (mbr.presence.status != 'offline') onlineCount++
        else offlineCount++
    })

    const stat = {
        tod: tempTime,
        member_online_count:  onlineCount,
        member_offline_count: offlineCount,
        member_count:         mbr.size,
        member_joined_count:  tempJoinCount,
        member_left_count:    tempLeaveCount
    }

    await dbCon.insertOne(stat)

    tempTime       = Math.floor(Date.now() / 1000)
    tempLeaveCount = 0
    tempJoinCount  = 0

    if (postStatus) {
        await webhook.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Hourly Analytics")
                    .setColor('#cafc03')
                    .setDescription(`Showing analytics data of time period <t:${stat.tod}> - <t:${Math.floor(Date.now() / 1000)}>.`)
                    .addFields(
                        { name: "Members Online"    , value: `\`${stat.member_online_count}\`` , inline: true },
                        { name: "Members Offline"   , value: `\`${stat.member_offline_count}\``, inline: true },
                        { name: "Member Count"      , value: `\`${stat.member_count}\``        , inline: true },
                        { name: "Member Join Count" , value: `\`${stat.member_joined_count}\`` , inline: true },
                        { name: "Member Leave Count", value: `\`${stat.member_left_count}\``   , inline: true }
                    )
                    .setTimestamp()
            ]
        })
    }
}

async function generateDayStart(deleteHourlyReports?: boolean) {
    // wipe all previous reports
    await dbCon_dayStart.deleteMany({})
    if (deleteHourlyReports) await dbCon.deleteMany({})

    await dbCon_dayStart.insertOne({
        day: Math.floor(Date.now() / 1000),
        member_count: (await client.guilds.fetch(guild)).memberCount
    } as schema$dayStart)
}

async function generateDailyReport() {
    let ret: schema$dailyReport = {
        day: Math.floor(Date.now() / 1000),
        member_peak_count: 0,
        member_peak_time: 0,
        member_joined_count: 0,
        member_left_count: 0,
        start_of_day_member_count: 0
    }
    let entries = await dbCon.find({ day: { $gte: Math.floor(Date.now() / 1000) - 86400 } }).toArray()
    const dayStart: schema$dayStart = await dbCon_dayStart.findOne() as any
    if (entries.length < 5) ret.notes = "Not enough data to generate proper report."

    for (let i = 0; i < entries.length; i++) {
        const entry: schema$hourlyReport = entries[i] as any

        if (entry.member_count > ret.member_peak_count) ret.member_peak_count = entry.member_count
        if (entry.member_count > ret.member_peak_count) ret.member_peak_time = entry.tod

        ret.member_joined_count += entry.member_joined_count
        ret.member_left_count += entry.member_left_count

    }

    if (dayStart) ret.start_of_day_member_count = dayStart.member_count
    return ret
}

async function dayPassCb() {
    // TODO: work on

    // generate daily report
    const dailyReport = await generateDailyReport()
    webhook.send(JSON.stringify(dailyReport))

    // wipe if new week
    if (new Date().getDay() == 6) {
        // generate weekly report
        const report: schema$weeklyReport = {}
    }


}

*/ 
//# sourceMappingURL=analytics.js.map