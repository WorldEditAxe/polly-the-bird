/*
import { db } from "../donations/donoDb.js"

// user ids here
const exclude = ["517442488881905674", "492498394581958671", "864152595681640448", "531638224834265100", "760629814448095314", "687062676916142097", "569745745595334677", "773429776194863126"]
const ents = await db.find().toArray()

for (const v of ents) {
    if (!exclude.includes(v.user_id)) {
        const modded = { ...v }

        modded._id = undefined
        modded.events += modded.special
        modded.special = 0

        await db.deleteOne({ user_id: v.user_id })
        await db.insertOne(modded)
    }
}
*/
