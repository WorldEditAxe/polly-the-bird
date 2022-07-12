import * as sqlite3 from "better-sqlite3";
import { MongoClient } from "mongodb";
import { EventEmitter } from "events";
let dbType, started = false, starting = false;
const events = new EventEmitter();
// better-sqlite3 objects
let sqliteDb;
// mongodb objects
let mongoDb, mongoClient;
export async function init(type, cmds, uri) {
    if (started || starting)
        return;
    starting = true;
    dbType = type;
    if (type == 'SQLITE') {
        sqliteDb = sqlite3.default(uri !== null && uri !== void 0 ? uri : "./cooldowns.db");
        await preinitCommands(cmds);
    }
    else {
        mongoClient = await new MongoClient(uri !== null && uri !== void 0 ? uri : process.env.COOLDOWN_DB_URI).connect();
        mongoDb = mongoClient.db('cooldown_db');
        await mongoDb.command({ ping: 1 });
    }
    starting = false;
    started = true;
    events.emit('loaded');
}
// Internal function - do not run if you don't know what you're doing!
export async function preinitCommands(cmds) {
    if (dbType != 'SQLITE')
        throw new Error("This is not available for MongoDB cooldown databases!");
    for (const cmd of cmds) {
        sqliteDb.prepare(`CREATE TABLE IF NOT EXISTS cmd_${cmd} (user_id TEXT PRIMARY KEY, cooldown INTEGER NOT NULL);`).run();
    }
}
// TODO check if working
export async function getCooldown(commandName, userId) {
    let ret;
    if (dbType == 'SQLITE') {
        ret = await sqliteDb.prepare(`SELECT cooldown FROM cmd_${commandName} WHERE user_id = ?;`).get(userId);
        if (ret && Math.floor(Date.now() / 1000) > ret.cooldown)
            sqliteDb.prepare(`DELETE FROM cmd_${commandName} WHERE user_id = ?`).run(userId);
    }
    else {
        ret = await mongoDb.collection(`cmd_${commandName}`).findOne({ user_id: userId });
        if (ret && Math.floor(Date.now() / 1000) > ret.cooldown)
            await mongoDb.collection(`cmd_${commandName}`).deleteOne({ user_id: userId });
    }
    return ret ? ret.cooldown : 0;
}
export async function deleteCooldown(commandName, userId) {
    if (dbType == 'SQLITE') {
        sqliteDb.prepare(`DELETE FROM cmd_${commandName} WHERE user_id = ?;`).run(userId);
    }
    else {
        await mongoDb.collection(`cmd_${commandName}`).deleteOne({ user_id: userId });
    }
}
export async function setCooldown(commandName, userId, time) {
    if (dbType == 'SQLITE') {
        sqliteDb.prepare(`INSERT OR REPLACE INTO cmd_${commandName} (user_id, cooldown) VALUES (?, ?);`).run(userId, time);
    }
    else {
        await mongoDb.collection(`cmd_${commandName}`).updateOne({ user_id: userId }, { $set: { user_id: userId, cooldown: time } }, { upsert: true });
    }
}
//# sourceMappingURL=cooldownDb.js.map