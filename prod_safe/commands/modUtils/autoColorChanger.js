import randomColor from "../../lib/randColors.js";
import { awaitStart, getGlobalPersistentDb } from "../database.js";
const snooze = (ms) => new Promise(res => setTimeout(res, ms));
let db, roleObj;
const roleId = '788738306770206790', guildId = '784491141022220309';
export async function staticBlock() {
    await awaitStart();
    const client = global.bot.djsClient;
    roleObj = await (await client.guilds.fetch(guildId)).roles.fetch(roleId);
    db = (await getGlobalPersistentDb()).collection('color_changer');
    asyncLoop();
}
async function asyncLoop() {
    while (true) {
        try {
            const lastChanged = await getLastUpdated();
            if (lastChanged instanceof Array) {
                await roleObj.setColor(randomColor(), "Automatic daily color change | Automated action.");
                await updateLastUpdated(Math.floor(Date.now() / 1000));
            }
            else if ((Math.floor(Date.now() / 1000) >= (lastChanged + 86400))) {
                await roleObj.setColor(randomColor(), "Automatic daily color change | Automated action.");
                await updateLastUpdated(Math.floor(Date.now() / 1000));
            }
            await snooze(60 * 1000);
        }
        catch (_a) { }
    }
}
async function getLastUpdated() {
    let ret = await db.findOne({});
    if (ret) {
        return ret.last_updated;
    }
    else {
        ret = await db.insertOne({ last_updated: Math.round(Date.now() / 1000) });
        return [ret.last_updated, true];
    }
}
async function updateLastUpdated(time) {
    if (!await db.findOne({})) {
        await db.insertOne({ last_updated: time });
    }
    else {
        await db.updateOne({}, { $set: { last_updated: time } });
    }
}
//# sourceMappingURL=autoColorChanger.js.map