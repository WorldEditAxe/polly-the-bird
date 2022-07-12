import { User } from "discord.js";
import { awaitStart, getDb } from "../../database.js";
import { UserEntry } from "./classes.js";
await awaitStart();
const db = (await getDb('grants')).collection("grants_merchants");
export async function getUser(user) {
    user = user instanceof User ? user.id : user;
    const f = await db.findOne({ user_id: user }) || {
        user_id: user,
        grant_list: []
    };
    return new UserEntry(f.user_id, f.grant_list);
}
export async function saveUserEntry(entry) {
    await db.replaceOne({
        user_id: entry.user
    }, entry.toObject(), {
        upsert: true
    });
}
export async function saveUserEntryRaw(entry) {
    await db.replaceOne({
        user_id: entry.user_id
    }, entry, {
        upsert: true
    });
}
export function massFetch(ids) {
    return db.find({ user_id: { $in: ids } }).limit(3).toArray();
}
export function getAll() {
    return db.find();
}
//# sourceMappingURL=db_wrapper.js.map