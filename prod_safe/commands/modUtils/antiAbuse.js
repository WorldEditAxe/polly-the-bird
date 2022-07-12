import { Permissions } from "discord.js";
const snooze = ms => new Promise(res => setTimeout(res, ms));
const pingList = new Map(), managerRoles = ['785198646731604008', '791516116710064159'], tolerance = 3, ttl = 30 * 60 * 1000;
export async function staticBlock() {
    const client = global.bot.djsClient;
    client.on('messageCreate', async (m) => {
        var _a;
        if (!m.guild)
            return;
        if (m.mentions.everyone || (m.cleanContent.includes('@here') && m.member.permissionsIn(m.channel).has(Permissions.FLAGS.MENTION_EVERYONE))) {
            pingList.set(m.author.id, ((_a = pingList.get(m.author.id)) !== null && _a !== void 0 ? _a : 0) + 1);
            if (pingList.get(m.author.id) >= tolerance || (m.member.roles.cache.some(r => managerRoles.includes(r.id)) && !m.member.roles.cache.has('791516118120267806'))) {
                try {
                    await m.member.ban({ reason: `everyone ping tolerance exceeded threshold.` });
                }
                catch (_b) { }
            }
            await snooze(ttl);
            try {
                const val = pingList.get(m.author.id) - 1;
                if (val < 1) {
                    pingList.delete(m.author.id);
                }
                else {
                    pingList.set(m.author.id, val);
                }
            }
            catch (_c) { }
        }
    });
}
//# sourceMappingURL=antiAbuse.js.map