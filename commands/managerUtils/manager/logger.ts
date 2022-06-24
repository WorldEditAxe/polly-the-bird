import { Client, User } from "discord.js"
import { events, giveaways } from "./db_wrapper.js"

const client: Client = global.bot.djsClient

// constants
const GIVEAWAY_ROLE_ID = '785198646731604008'
const EVENT_ROLE_ID = '791516116710064159'

const EVENT_PING_CHANNEL = '870198964635467787'
const EVENT_ROLE_PING = '925228998492061806'

client.on('messageCreate', async msg => {
    if (!msg.guild || (!msg.member.roles.cache.has(GIVEAWAY_ROLE_ID) && !msg.member.roles.cache.has(EVENT_ROLE_ID))) return
    if (msg.member.roles.cache.has(EVENT_ROLE_ID)) {
        if (msg.guild && msg.channelId == EVENT_PING_CHANNEL && msg.mentions.roles.has(EVENT_ROLE_PING)) {
            
        }
    }
})