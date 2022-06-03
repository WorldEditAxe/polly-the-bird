import { Client, MessageEmbed, User } from "discord.js";
import { awaitStart, getGlobalPersistentDb } from "../../database.js";

await awaitStart()
const db = (await getGlobalPersistentDb()).collection("blacklists")

const INFINITY = 'infinity'

type schema$blacklistEntry = {
    user_id: string,
    reason: string,
    expiry_time: number | typeof INFINITY
}

type blacklistArgs = {
    user_id: string,
    reason: string,
    expiry_time?: number | typeof INFINITY,
    expiry_date?: Date
}

type schema$fetchResponse = {
    user_id: string,
    banned: boolean,
    reason?: string,
    expiry_time?: number | typeof INFINITY
}

export async function getUserBlacklistDetails(usr: User | string, id = usr instanceof User ? usr.id : usr): Promise<schema$fetchResponse> {
    const ret: schema$fetchResponse = {
        user_id: id,
        banned: undefined
    }
    const fetched = (await db.findOne({ user_id: id }) as any) as schema$blacklistEntry

    if (fetched) {
        if (fetched.expiry_time != 'infinity') {
            if (fetched.expiry_time < Math.floor(Date.now() / 1000)) {
                db.findOneAndDelete({ user_id: id })
                    .then(async () => {
                        const user = usr instanceof User 
                            ? usr 
                            : (global.bot.djsClient as Client).users.cache.get(id) || await (global.bot.djsClient as Client).users.fetch(id).catch(() => {})
                        
                        if (user) {
                            user.createDM()
                                .then(c => {
                                    c.send({
                                        embeds: [
                                            new MessageEmbed()
                                                .setTitle("Unblacklisted")
                                                .setColor('#32a852')
                                                .setDescription("Your blacklist for `" + fetched.reason + "` has expired and access to bot commands has been granted.")
                                                .setTimestamp()
                                        ]
                                    }).catch(() => {})
                                })
                                .catch(() => {})
                        }
                    })
                ret.banned = false
                return ret
            } else {
                ret.banned = true
                ret.reason = fetched.reason
                ret.expiry_time = typeof fetched.expiry_time == 'number'
                    ? fetched.expiry_time
                    : Number.POSITIVE_INFINITY
                return ret
            }
        } else {
            ret.banned = true
            ret.reason = fetched.reason
            ret.expiry_time = typeof fetched.expiry_time == 'number'
                ? fetched.expiry_time
                : Number.POSITIVE_INFINITY
            return ret
        }
    } else {
        ret.banned = false
        return ret
    }
}

export async function blacklistUser(options: blacklistArgs) {
    const exists = await db.findOne({ user_id: options.user_id }) as any as schema$blacklistEntry
    let time

    if (options.expiry_time) {
        time = options.expiry_time
    }
    else if (options.expiry_date) time = Math.floor(options.expiry_date.getTime() / 1000)
    else {
        throw new Error("Either one of the options expiry_time and expiry_date must be passed.")
    }

    if (!exists) {
        await db.insertOne({
            user_id: options.user_id,
            reason: options.reason,
            expiry_time: time
        })
    } else if (exists.expiry_time != INFINITY) {
        if (exists.expiry_time < Math.floor(Date.now() / 1000)) {
            await db.deleteOne({ user_id: options.user_id, expiry_time: exists.expiry_time })

            await db.insertOne({
                user_id: options.user_id,
                reason: options.reason,
                expiry_time: time
            })
        } else { throw new Error("User's existing blacklist is currently active!") }
    } else { throw new Error("User's existing blacklist is currently active!") }
}

export async function unblacklistUser(user: User | string) {
    const id = user instanceof User ? user.id : user
    const exists = await db.findOne({ user_id: id })

    if (!exists) throw new Error("User isn't blacklisted!")
    else await db.findOneAndDelete({ user_id: id })
}