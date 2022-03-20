import * as sqlite3 from "better-sqlite3";
import { Db, MongoClient } from "mongodb";
import { EventEmitter } from "events";

let dbType: 'SQLITE' | 'MONGODB', started = false, starting = false
const events = new EventEmitter()

// better-sqlite3 objects
let sqliteDb: sqlite3.Database

// mongodb objects
let mongoDb: Db, mongoClient: MongoClient

export async function init(type: 'SQLITE' | 'MONGODB', cmds: string[], uri?: string) {
    if (started || starting) return
    starting = true
    dbType = type

    if (type == 'SQLITE') {
        sqliteDb = sqlite3.default(uri ?? "./cooldowns.db")

        await preinitCommands(cmds)
    } else {
        mongoClient = await new MongoClient(uri ?? process.env.COOLDOWN_DB_URI).connect()
        mongoDb = mongoClient.db('cooldown_db')
        await mongoDb.command({ ping: 1 })
    }

    starting = false
    started = true

    events.emit('loaded')
}

// Internal function - do not run if you don't know what you're doing!
export async function preinitCommands(cmds: string[]) {
    if (dbType != 'SQLITE') throw new Error("This is not available for MongoDB cooldown databases!")

    for (const cmd of cmds) {
        sqliteDb.prepare(`CREATE TABLE IF NOT EXISTS cmd_${cmd} (user_id TEXT PRIMARY KEY, cooldown INTEGER NOT NULL);`).run()
    }
}

// TODO check if working
export async function getCooldown(commandName: string, userId: string): Promise<number> {
    let ret

    if (dbType == 'SQLITE') {
        ret = await sqliteDb.prepare(`SELECT cooldown FROM cmd_${commandName} WHERE user_id = ?;`).get(userId)
        if (ret && Math.floor(Date.now() / 1000) > ret.cooldown) sqliteDb.prepare(`DELETE FROM cmd_${commandName} WHERE user_id = ?`).run(userId)
    } else {
        ret = await mongoDb.collection(`cmd_${commandName}`).findOne({ user_id: userId })
        if (ret && Math.floor(Date.now() / 1000) > ret.cooldown) await mongoDb.collection(`cmd_${commandName}`).deleteOne({ user_id: userId })
    }

    return ret ? ret.cooldown as number : 0
}

export async function deleteCooldown(commandName: string, userId: string) {
    if (dbType == 'SQLITE') {
        sqliteDb.prepare(`DELETE FROM cmd_${commandName} WHERE user_id = ?;`).run(userId)
    } else {
        await mongoDb.collection(`cmd_${commandName}`).deleteOne({ user_id: userId })
    }
}

export async function setCooldown(commandName: string, userId: string, time: number) {
    if (dbType == 'SQLITE') {
        sqliteDb.prepare(`INSERT OR REPLACE INTO cmd_${commandName} (user_id, cooldown) VALUES (?, ?);`).run(userId, time)
    } else {
        await mongoDb.collection(`cmd_${commandName}`).updateOne({ user_id: userId }, { $set: { user_id: userId, cooldown: time } }, { upsert: true })
    }
}