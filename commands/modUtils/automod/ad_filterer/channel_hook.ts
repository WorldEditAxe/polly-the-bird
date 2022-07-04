import { Client, Permissions, TextChannel } from "discord.js";
import { logModerationAction } from "../automod_utils.js";
import { classify, TextType } from "./ai.js";
import * as config from "./config.js"

const client: Client = global.bot.djsClient

client.on('messageCreate', async msg => {
    if (!msg.guild || msg.author.bot) return
    if (!(msg.channel as TextChannel).permissionsFor(client.user.id).has(Permissions.FLAGS.SEND_MESSAGES) || !(msg.channel as TextChannel).permissionsFor(client.user.id).has(Permissions.FLAGS.MANAGE_MESSAGES)) return
    if (!msg.content) return
    // if (msg.member.roles.cache.has('791516118120267806')) return

    if (msg.channelId == config.BUYING_ADS_CHANNEL) {
        const res = await classify(msg.content)
        if (res != TextType.BUYING_AD) {
            await msg.delete()
                .catch(() => {})
            const m = await msg.channel.send(`<@${msg.author.id}>, that's not a buying ad. Please consider rephrasing your ad if you believe this is in error.`)
            await new Promise(res => setTimeout(res, 5000))
            await m.delete()
            await logModerationAction("Deleted Advertisement", msg.author, "User attempted to send non-buying ad in buying ad channel.", undefined, [{
                name: "Ad Content", value: msg.content, inline: true
            }])
        }
    } else if (msg.channelId == config.SELLING_ADS_CHANNEL) {
        const res = await classify(msg.content)
        if (res != TextType.SELLING_AD) {
            await msg.delete()
                .catch(() => {})
            const m = await msg.channel.send(`<@${msg.author.id}>, that's not a selling ad. Please consider rephrasing your ad if you believe this is in error.`)
            await new Promise(res => setTimeout(res, 5000))
            await m.delete()
            await logModerationAction("Deleted Advertisement", msg.author, "User attempted to send non-selling ad in selling ad channel.", undefined, [{
                name: "Ad Content", value: msg.content, inline: true
            }])
        }
    } else if (msg.channelId == config.DUELING_ADS_CHANNEL) {
        const res = await classify(msg.content)
        if (res != TextType.DUELING_AD) {
            await msg.delete()
                .catch(() => {})
            const m = await msg.channel.send(`<@${msg.author.id}>, that's not a dueling ad. Please consider rephrasing your ad if you believe this is in error.`)
            await new Promise(res => setTimeout(res, 5000))
            await m.delete()
            await logModerationAction("Deleted Advertisement", msg.author, "User attempted to send non-fighting ad in fighting ad channel.", undefined, [{
                name: "Ad Content", value: msg.content, inline: true
            }])
        }
    }
})