import { Client, MessageEmbed, TextChannel, User } from "discord.js"
import { events, giveaways, ManagerType, setManagerDayQuota } from "./db_wrapper.js"

const client: Client = global.bot.djsClient

// constants
const EVENT_ROLE_ID = '791516116710064159'

const EVENT_PING_CHANNEL = '870198964635467787'
const EVENT_ROLE_PING = '925228998492061806'

enum GiveawayType {
    SMALL = "SMALL",
    BIG = "BIG"
}

const FRISKY_ID = '700743797977514004'
const GIVEAWAY_CHANNELS = {
    BIG: [
        '870237889194254376', // insta millionare channel
        '870238498806976512'  // giveaways channel
    ],
    SMALL: [
        '870237922119524382', // mega giveaways channel
        '870237803424907276'  // booster giveaways
    ]
}
const GIVEAWAY_POINT_MAPPINGS = {
    SMALL: 1,
    BIG: 2
}

function getGiveawayHost(embed: MessageEmbed): string {
    const p1 = embed.description.split(/\n/g).filter(s => s.startsWith("Hosted by "))
    if (!p1) return undefined
    else {
        return p1[p1.length - 1].toLowerCase().replace("Hosted by ", '').replace(/[^1-9]/g, '')
    }
}

client.on('messageCreate', async msg => {
    if ((msg.author.bot && msg.author.id != FRISKY_ID) || msg.webhookId || msg.system || !msg.guild) return

    if (msg.author.id == FRISKY_ID && (GIVEAWAY_CHANNELS.BIG.includes(msg.channelId) || GIVEAWAY_CHANNELS.SMALL.includes(msg.channelId))) {
        // giveaway handling
        if (msg.embeds.length != 1) return
        if (!msg.embeds[0].description) return
        if (!msg.embeds[0].description.toLowerCase().startsWith("react with 🎉 to enter")) return
        const parsed = getGiveawayHost(msg.embeds[0])
        
        if (parsed) {
            const fetchedUsr = parsed ? await client.users.fetch(parsed).catch(() => {}) : null
            if (!fetchedUsr) return
            await setManagerDayQuota(fetchedUsr, ManagerType.GIVEAWAYS, GIVEAWAY_CHANNELS.BIG.includes(msg.channelId) ? GIVEAWAY_POINT_MAPPINGS.BIG : GIVEAWAY_POINT_MAPPINGS.SMALL, { action: 'INC'})
        }
    } else {
        // event man handling
        const mbr = msg.member || await msg.guild.members.fetch(msg.author.id)
        if (mbr.roles.cache.has(EVENT_ROLE_ID)) {
            if (msg.guild && msg.channelId == EVENT_PING_CHANNEL && msg.mentions.roles.has(EVENT_ROLE_PING)) {
                await setManagerDayQuota(msg.author, ManagerType.EVENTS, 1, { action: 'INC' })
            }
        }
    }
})

console.log((await (await client.channels.fetch('914793234935468042') as TextChannel).messages.fetch('990040455339180177')).embeds[0].description)