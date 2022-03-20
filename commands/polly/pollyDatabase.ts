import { Client } from "discord.js"
import { MongoClient, Collection } from "mongodb"

let cookieDb: Collection

export const schema = {
    user_id: "0",
    cookies: 0,
    startDate: 0
}

export async function init(mongoUri?: string) {
    const db = (await new MongoClient(mongoUri || process.env.MONGO_URI).connect()).db('cookies')
    await db.command({ ping: 1 })
    cookieDb = db.collection('cookies_db')
}

export async function userExists(userId: string): Promise<boolean> {
    
    return await cookieDb.findOne({ user_id: userId }) != null
}

export async function initUser(userId: string) {
    const ins = { ...schema }

    ins.user_id = userId
    ins.startDate = Math.round(Date.now() / 1000)

    await cookieDb.insertOne(ins as any)
}

export async function setCookie(userId: string, count?: number) {
    if (!await userExists(userId)) await initUser(userId)
    await cookieDb.updateOne({ user_id: userId }, { $set: { cookies: count } })
}

export async function getUserProfile(userId: string): Promise<typeof schema> {
    if (!await userExists(userId)) await initUser(userId)
    return (await cookieDb.findOne({ user_id: userId }) as unknown) as typeof schema
}

export async function addCookies(userId: string, count?: number) {
    if (!await userExists(userId)) await initUser(userId)
    await cookieDb.updateOne({ user_id: userId }, { $inc: { cookies: count || 1 } })
}

export async function deleteUser(userId: string) {
    await cookieDb.deleteOne({ user_id: userId })
}

export async function staticBlock() {
    await init();
    (global.bot.djsClient as Client).on('messageCreate', async m => {
        const content = m.content.toLowerCase()

        if (m.mentions.has(m.client.user)) {
            try { await m.channel.send("birb :sunglasses:") }
            catch {}
        } else if (content.includes('polly is based')) {
            try { await m.channel.send("polly is based brib") }
            catch {}
        } else if (content.includes("fuck polly")) {
            try { await m.channel.send('POLLY DETECC DISRESPECC >:(') }
            catch {}
        }
    })
}