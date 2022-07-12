import { Message, WebhookClient } from "discord.js";
import { Logger } from "mongodb";
import { awaitStart, getDb } from "../../database.js";
import { handleError, post } from "../../errorLogger.js";
await awaitStart();
const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/994873700442705981/dcgriXKH0Xk9OM9tKjb_SRuNLhV6ptR_SW9oCwHQfHGSWjMcjH-UCgFOhqXuuh9f-SkA" });
const starboard_id = '994787484913385492';
const logger = new Logger("STARBOARD-LIB");
const db = (await getDb("starboard")).collection("merch-save-list");
const starboardChannel = await global.bot.djsClient.channels.fetch(starboard_id);
export async function pinOnStarboard(msg) {
    const mbr = msg.member || await msg.guild.members.fetch(msg.author.id);
    const id = await webhook.send({
        username: mbr.displayName,
        avatarURL: mbr.displayAvatarURL(),
        content: msg.content || undefined,
        files: [...msg.attachments.values()],
        embeds: msg.embeds,
        allowedMentions: { parse: [] }
    })
        .catch(error => {
        logger.error(`Error attempting to send starboard embed to starboard channel! Error: ${error.stacK}`);
        handleError(error, "Starboard Pin Error").catch(() => { });
        post(JSON.stringify(msg)).catch(() => { });
    });
    return id ? id.id : undefined;
}
export async function removeFromStarboard(msg) {
    msg = msg instanceof Message ? msg.id : msg;
    const res = await db.findOne({ message_id: msg });
    if (res) {
        await starboardChannel.messages.delete(res.message_id);
        db.deleteOne({ message_id: res.message_id });
        const c = await global.bot.djsClient.channels.fetch(res.original_chan_id).catch(() => { });
        if (!c)
            return;
        const f = await c.messages.fetch(res.original_msg_id).catch(() => { });
        if (f) {
            const e = f.reactions.cache.get('994885114825801748');
            if (e)
                e.remove().catch(() => { });
            const e1 = f.reactions.cache.get('✅');
            if (e1)
                e1.remove().catch(() => { });
        }
    }
}
export async function isOnStarboard(message) {
    message = message instanceof Message ? message.id : message;
    return !!(await db.findOne({ message_id: message }));
}
export async function markMessageAsStarred(starredId, message, original_chan_id) {
    message = message instanceof Message ? message.id : message;
    starredId = starredId instanceof Message ? starredId.id : starredId;
    await db.insertOne({ message_id: starredId, original_msg_id: message, original_chan_id: original_chan_id });
}
//# sourceMappingURL=lib.js.map