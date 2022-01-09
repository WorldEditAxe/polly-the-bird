import { Client } from "discord.js";
import { Collection } from "mongodb";
import { awaitStart, getDb } from "../database.js";
import { init } from "../polly/pollyDatabase.js";

await awaitStart()
const database = await getDb('boostTracker')
const client: Client = global.bot.djsClient

export const dbSchema = {
    user_id: "0",
    active_boosts: 0,
    total_boosts: 0
}

async function inited(user: string): Promise<boolean> { return await database.collection('boosts').findOne({ user_id: user }) != null }

async function initUser(user: string) {
    const clone = { ...dbSchema }

    dbSchema.user_id = user

    await database.collection('boosts').insertOne(clone)
}

async function getUserInfo(user: string): Promise<typeof dbSchema> {
    if (!await inited(user)) await initUser(user)
    return await database.collection('boosts').findOne({ user_id: user }) as any
}

async function runArbitraryCall(call: (c: Collection) => any) {
    return await call(database.collection('boosts'))
}

export async function staticBlock() {

    client.on('guildMemberUpdate', (oldMem, newMem) => {
        if (!newMem.premiumSince && !oldMem.premiumSince) {
            // no boost :(
            runArbitraryCall(async (c) => {
                if (!await inited(newMem.id)) return await initUser(newMem.id)
                await c.updateOne({ user_id: newMem.id }, { $set: { active_boosts: 0 } })
            })
        }
    })

    client.on('messageCreate', m => {
        if (m.type == 'USER_PREMIUM_GUILD_SUBSCRIPTION'
            || m.type == 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1'
            || m.type == 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2'
            || m.type == 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3') {
            
        }
    })
}