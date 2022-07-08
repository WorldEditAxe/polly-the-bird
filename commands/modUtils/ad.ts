import { Client, Presence } from "discord.js";

const client: Client = global.bot.djsClient

const PREMIUM_ROLE = '994870138199355452' // placeholder, change to actual role when? this is the id of the me > you role
const CONTENT = ["discord.gg/merchants", ".gg/merchants"]

client.on('presenceUpdate', async (oldStatus, newStatus) => {
    if (newStatus.user.bot || newStatus.guild.id != '784491141022220309') return
    let hasContentInStatus = false
    if ((newStatus as Presence).member.roles.cache.has(PREMIUM_ROLE)) {
        for (const status of newStatus.activities) {
            if (status.type == 'CUSTOM') {
                if (!status.state) {
                    break
                } else {
                    const lowered = status.state.toLowerCase()

                    for (const ent of CONTENT) {
                        let l = false
                        for (const part of lowered.split(/ /g)) {
                            if (part == ent) {
                                l = true
                                hasContentInStatus = true
                                break
                            }
                        }
                        if (l) break
                    }

                    break
                }
            }
        }
    } else {
        for (const status of newStatus.activities) {
            if (status.type == 'CUSTOM') {
                if (!status.state) break
                else {
                    const lowered = status.state.toLowerCase()

                    for (const ent of CONTENT) {
                        let l = false
                        for (const part of lowered.split(/ /g)) {
                            if (part == ent) {
                                l = true
                                hasContentInStatus = true
                                break
                            }
                        }
                        if (l) break
                    }

                    break
                }
            }
        }
    }

    if (newStatus.member.roles.cache.has(PREMIUM_ROLE) && !hasContentInStatus) await newStatus.member.roles.remove(PREMIUM_ROLE).catch(() => {})
    else if (hasContentInStatus) await newStatus.member.roles.add(PREMIUM_ROLE).catch(() => {})
})