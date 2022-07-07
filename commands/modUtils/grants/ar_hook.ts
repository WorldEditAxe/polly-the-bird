import { Client, Permissions, TextChannel } from "discord.js";
import { awaitStart } from "../../database.js";
import { GrantType, schema$emojiARGrant, schema$textARGrant } from "./classes.js";
import { massFetch } from "./db_wrapper.js";

await awaitStart()

const client: Client = global.bot.djsClient

client.on('messageCreate', async msg => {
    if (!msg.guild) return
    if (msg.guild.id != '784491141022220309') return
    if (msg.mentions.members.size <= 0) return
    if (!(msg.channel as TextChannel).permissionsFor(client.user).has(Permissions.FLAGS.ADD_REACTIONS) || !(msg.channel as TextChannel).permissionsFor(client.user).has(Permissions.FLAGS.SEND_MESSAGES)) return

    const t = Math.floor(Date.now() / 1000)
    const fetched = (await massFetch(msg.mentions.members.map(mbr => mbr.id) as string[]))
        .filter(ent => ent.grant_list.some(grant => grant.grant_type == GrantType.TEXT_AR || grant.grant_type == GrantType.EMOJI_AR))
        .map(ent => ent.grant_list.filter(grant => grant.grant_type == GrantType.TEXT_AR || grant.grant_type == GrantType.EMOJI_AR)[0])
        .filter(grant => !grant.expiry_time || grant.expiry_time > t)

    for (const ar of fetched) {
        if (ar.grant_type == GrantType.EMOJI_AR) {
            msg.react((ar as schema$emojiARGrant).emoji_id).catch(() => {})
        } else if (ar.grant_type == GrantType.TEXT_AR) {
            msg.channel.send((ar as schema$textARGrant).response_message).catch(() => {})
        }
    }
})