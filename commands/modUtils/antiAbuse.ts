import { Client, Permissions, TextChannel } from "discord.js"

const snooze = ms => new Promise(res => setTimeout(res, ms))

const pingList = new Map<string, number>()
    , managerRoles = ['785198646731604008', '791516116710064159']
    , tolerance = 3
    , ttl = 30 * 60 * 1000

export async function staticBlock() {
    const client: Client = global.bot.djsClient
    
    client.on('messageCreate', async m => {
        if (!m.guild) return
        if (m.mentions.everyone || (m.cleanContent.includes('@here') && m.member.permissionsIn(m.channel as TextChannel).has(Permissions.FLAGS.MENTION_EVERYONE))) {
            pingList.set(m.author.id, (pingList.get(m.author.id) ?? 0) + 1)

            if (pingList.get(m.author.id) >= tolerance || m.member.roles.cache.some(r => managerRoles.includes(r.id))) {
                try { await m.member.ban({ reason: `everyone ping tolerance exceeded threshold.`, days: 1 }) }
                catch {}
            }

            await snooze(ttl)
            try {
                const val = pingList.get(m.author.id) - 1

                if (val < 1) {
                    pingList.delete(m.author.id)
                } else {
                    pingList.set(m.author.id, val)
                }
            } catch {}  
        }
    })
}