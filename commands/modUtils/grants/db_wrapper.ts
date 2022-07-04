import { User } from "discord.js";
import { awaitStart, getDb } from "../../database.js";
import { schema$userEntry, UserEntry } from "./classes.js";

await awaitStart()

const db = (await getDb('grants')).collection("grants_merchants")

export async function getUser(user: User | string): Promise<UserEntry> {
    user = user instanceof User ? user.id : user
    const f = await db.findOne({ user_id: user }) || {
        user_id: user,
        grant_list: []
    }
    return new UserEntry(f.user_id, f.grant_list)
}

export async function saveUserEntry(entry: UserEntry) {
    await db.updateOne({
        user_id: entry.user
    }, entry.toObject(), {
        upsert: true
    })
}