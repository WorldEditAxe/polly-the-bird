import { Db, MongoClient } from "mongodb";
import { EventEmitter } from "node:events";

const events = new EventEmitter()

export let mongoClient: MongoClient
let started = false

export function awaitStart(): Promise<void> {
   return new Promise<void>(res => {
       events.on('loaded', res)
   })
}

async function start(mongoUri?: string) {
    mongoClient = await new MongoClient(mongoUri || process.env.MONGO_URI).connect()

    started = true
    events.emit('loaded')
}

// always use instead of native call
export async function getDb(name: string): Promise<Db> {
    if (!started) await awaitStart()
    const db = mongoClient.db(name)
    // await init
    await db.command({ ping: 1 })
    return db
}