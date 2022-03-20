import { Client, Role } from "discord.js";
import { Collection } from "mongodb";
import randomColor from "../../lib/randColors.js";
import { awaitStart, getGlobalPersistentDb } from "../database.js";

const snooze = (ms: number) => new Promise<void>(res => setTimeout(res, ms))
let db: Collection, roleObj: Role
const roleId = '788738306770206790', guildId = '784491141022220309'

export async function staticBlock() {
    await awaitStart()
    const client: Client = global.bot.djsClient
    roleObj = await (await client.guilds.fetch(guildId)).roles.fetch(roleId)
    db = (await getGlobalPersistentDb()).collection('color_changer')

    asyncLoop()
}

async function asyncLoop() {
    while (true) {
        try {
            const lastChanged = await getLastUpdated()

            if (lastChanged instanceof Array) {
                await roleObj.setColor(randomColor(), "Automatic daily color change | Automated action.")
                await updateLastUpdated(Math.floor(Date.now() / 1000))
            } else if ((Math.floor(Date.now() / 1000) >= (lastChanged as number + 86400))) {
                await roleObj.setColor(randomColor(), "Automatic daily color change | Automated action.")
                await updateLastUpdated(Math.floor(Date.now() / 1000))
            }
            
            await snooze(60 * 1000)
        } catch {}
    }
}

async function getLastUpdated(): Promise<number | [number, boolean]> {
    let ret = await db.findOne({}) as any

    if (ret) {
        return ret.last_updated
    } else {
        ret = await db.insertOne({ last_updated: Math.round(Date.now() / 1000) })
        return [ret.last_updated, true]
    }
}

async function updateLastUpdated(time: number) {
    if (!await db.findOne({})) {
        await db.insertOne({ last_updated: time })
    } else {
        await db.updateOne({}, { $set: { last_updated: time } })
    }
}