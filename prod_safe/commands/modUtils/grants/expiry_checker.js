import { Logger } from "../../../lib/logger.js";
import { awaitStart, getGlobalPersistentDb } from "../../database.js";
import { UserEntry } from "./classes.js";
import { getAll, saveUserEntryRaw } from "./db_wrapper.js";
await awaitStart();
const globalDb = (await getGlobalPersistentDb()).collection('expiry_checker');
const logger = new Logger("GRANTS");
async function getLastSweepedTime() {
    const f = await globalDb.findOne({ type: "grants_expiry_checker" });
    return f ? new Date(f.time) : new Date(0);
}
async function updateLastSweep(time) {
    await globalDb.updateOne({
        type: "grants_expiry_checker"
    }, {
        $set: {
            type: "grants_expiry_checker",
            time: time ? time.getTime() : Date.now()
        }
    }, {
        upsert: true
    });
}
export function checkUserExpiry(dbEnt) {
    const ent = new UserEntry(dbEnt.user_id, dbEnt.grant_list);
    const d = Date.now();
    ent.getGrants().forEach(grant => {
        if (grant.expiryDate && grant.expiryDate.getTime() <= d) {
            grant.onRemove();
            ent.removeGrant(grant);
        }
    });
    return ent.toObject();
}
async function loop() {
    while (true) {
        const msSinceLastSweep = Date.now() - (await getLastSweepedTime()).getTime();
        const shouldSweep = msSinceLastSweep >= 86400000;
        if (shouldSweep) {
            logger.info("Sweeping expired grants...");
            await getAll()
                .forEach((ent) => {
                saveUserEntryRaw(checkUserExpiry(ent));
            });
            logger.info("Sweeped. Updating last sweep time.");
            await updateLastSweep();
        }
        else {
            logger.info(`A day has not passed since a sweep has occurred. Retrying sweep in ${86400000 - msSinceLastSweep} ms.`);
            await new Promise(res => setTimeout(res, 86400000 - msSinceLastSweep));
        }
    }
}
loop();
//# sourceMappingURL=expiry_checker.js.map