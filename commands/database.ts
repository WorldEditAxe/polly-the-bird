import { Db, MongoClient } from "mongodb";
import { EventEmitter } from "node:events";

const events = new EventEmitter()

export let mongoClient: MongoClient
let started = false
let starting = false

export function awaitStart(): Promise<void> {
   return new Promise<void>(res => {
       if (started) res()
       start()
       events.on('loaded', res)
   })
}

export async function getGlobalPersistentDb(): Promise<Db> {
    return await getDb("global_persistent_db")
}

async function start(mongoUri?: string) {
    if (starting) return
    starting = true
    mongoClient = await new MongoClient(mongoUri || process.env.MONGO_URI).connect()

    started = true
    events.emit('loaded')
}

// always use instead of native call
export async function getDb(name: string): Promise<Db> {
    if (!started) throw new Error('Cannot fetch database before initialization!')
    const db = mongoClient.db(name)
    // await init
    await db.command({ ping: 1 })
    return db
}

await start()