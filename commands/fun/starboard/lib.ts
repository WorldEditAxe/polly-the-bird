import { Client, Message, MessageEmbed, MessagePayload, TextChannel, WebhookClient } from "discord.js";
import { Logger, ObjectId } from "mongodb";
import { awaitStart, getDb } from "../../database.js";
import { handleError, post } from "../../errorLogger.js";

await awaitStart()

const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/994873700442705981/dcgriXKH0Xk9OM9tKjb_SRuNLhV6ptR_SW9oCwHQfHGSWjMcjH-UCgFOhqXuuh9f-SkA" })
const starboard_id: string = '994787484913385492'
const logger = new Logger("STARBOARD-LIB")
const db = (await getDb("starboard")).collection("merch-save-list")
const starboardChannel: TextChannel = await (global.bot.djsClient as Client).channels.fetch(starboard_id) as any

type DBSavelistEntry = {
    _id: ObjectId,
    message_id: string,
    original_msg_id: string,
    original_chan_id: string
}

export async function pinOnStarboard(msg: Message): Promise<string> {
    const mbr = msg.member || await msg.guild.members.fetch(msg.author.id)

    const id = await webhook.send({
        username: mbr.displayName,
        avatarURL: mbr.displayAvatarURL(),
        content: msg.content || undefined,
        files: [...msg.attachments.values()],
        embeds: msg.embeds,
        allowedMentions: { parse: [] }
    })
        .catch(error => {
            logger.error(`Error attempting to send starboard embed to starboard channel! Error: ${error.stacK}`)
            handleError(error, "Starboard Pin Error").catch(() => {})
            post(JSON.stringify(msg)).catch(() => {})
        })

    return id ? id.id : undefined
}

export async function removeFromStarboard(msg: Message | string) {
    msg = msg instanceof Message ? msg.id : msg
    const res: DBSavelistEntry = await db.findOne({ message_id: msg }) as any
    if (res) {
        await starboardChannel.messages.delete(res.message_id)
        db.deleteOne({ message_id: res.message_id })

        const c = await (global.bot.djsClient as Client).channels.fetch(res.original_chan_id).catch(() => {}) as TextChannel
        if (!c) return
        const f = await c.messages.fetch(res.original_msg_id).catch(() => {})

        if (f) {
            const e = f.reactions.cache.get('994885114825801748')
            if (e) e.remove().catch(() => {})
            const e1 = f.reactions.cache.get('✅')
            if (e1) e1.remove().catch(() => {})
        }
    }
}

export async function isOnStarboard(message: Message | string): Promise<boolean> {
    message = message instanceof Message ? message.id : message
    return !!(await db.findOne({ message_id: message }))
}

export async function markMessageAsStarred(starredId: Message | string, message: Message | string, original_chan_id: string) {
    message = message instanceof Message ? message.id : message
    starredId = starredId instanceof Message ? starredId.id : starredId
    await db.insertOne({ message_id: starredId, original_msg_id: message, original_chan_id: original_chan_id })
}