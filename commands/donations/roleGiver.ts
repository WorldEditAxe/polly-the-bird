import { Client, GuildMember, MessageEmbed } from "discord.js";
import { currency_symbol, eventBindings, prettify } from "./donoDb.js";

const donoDb = eventBindings
const client: Client = global.bot.djsClient

const donoMappings = {
    10000000: '787342156573704203',    // 10 mil donor
    25000000: '799022090791419954',    // 25 mil donor
    50000000: '787868761528336427',    // 50 mil donor
    100000000: '787868759720722493',   // 100 mil donor
    250000000: '799844364389187616',   // 250 mil donor
    500000000: '799022083778543696',   // 500 mil donor
    1000000000: '799844367551692827',  // 1 bil donor
    2500000000: '824615522934849607',  // 2.5 bil donor
    5000000000: '786610853033541632'   // 5 bil donor
}

const moneyDonoMappings = {
    5.00: '815013978563543100',
    25.00: '817298790494896139',
    50.00: '868316919630028800'
}

const roles = new Map<number, string>(), moneyRoles = new Map<number, string>()

for (const ent of Object.entries(donoMappings)) {
    roles.set(parseInt(ent[0]), ent[1])
}

for (const ent of Object.entries(moneyDonoMappings)) {
    moneyRoles.set(parseInt(ent[0]), ent[1])
}

async function donoUpdated(amount: number, member: GuildMember, money: boolean) {
    const rolesGiven = []
    let erroredRoles = []

    if (money) {

        for (const ent of moneyRoles) {
            const v = ent[1], k = ent[0]

            const role = await member.guild.roles.fetch(v)
            if (!member.roles.cache.has(v)) {
                let err = false

                if (amount >= k) {
                    try { await member.roles.add(role) }
                    catch { err = true; erroredRoles.push(role.name) }
    
                    if (!err) rolesGiven.push(role.name)
                }
            } else {
                if (k > amount) {
                    try { await member.roles.remove(role) }
                    catch {}
                }
            }
        }
    } else {

        for (const _e of roles) {
            const v = _e[1], k = _e[0]

            try {
                const role = await member.guild.roles.fetch(v)
                if (!member.roles.cache.has(v)) {
                    let err = false

                    if (amount >= k) {
                        try { await member.roles.add(role) }
                        catch { err = true; erroredRoles.push(role.name) }

                        if (!err) rolesGiven.push(role.name)
                    }
                } else {
                    if (k > amount) {
                        try { await member.roles.remove(role) }
                        catch {}
                    }
                }
            } catch {}
        }

    }

    if (rolesGiven.length > 0) {
        try {
            let roleString = '', erroredString = ''

            // construct string
            rolesGiven.forEach((v, i) => {
                if (rolesGiven.length == 1) {
                    roleString = `\`${v}\``
                    return
                }

                if (i == 1) {
                    roleString = `\`${v}\`, `
                    return
                }

                if (i < rolesGiven.length - 1) {
                    roleString += `${i == 2 ? "" : ", "} \`${v}\``
                } else {
                    roleString += ` and \`${v}\``
                }
            })

            if (erroredRoles.length > 0) {
                erroredRoles.forEach((v, i) => {
                    if (erroredRoles.length == 1) {
                        erroredString = `\`${v}\``
                        return
                    }

                    if (i == 1) {
                        erroredString = `\`${v}\`,`
                    }
    
                    if (i < erroredRoles.length - 1) {
                        erroredString += `${i == 2 ? "" : ', '} \`${v}\``
                    } else {
                        erroredString += ` and \`${v}\``
                    }
                })
            }

            if (erroredString.length >= 1 && erroredString.endsWith(',')) erroredString = erroredString.replace(/.$/, '')
            if (roleString.length >= 1 && roleString.endsWith(',')) roleString = roleString.replace(/.$/, '')

            try { await member.createDM() }
            catch {}

            await member.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("You got some roles for donating!")
                        .setColor(erroredRoles.length > 0 ? '#ff1111' : '#e1da51')
                        .setDescription(`For donating a total of \`${money ? '' : `${currency_symbol} `}${prettify(amount, money)}\`, you have obtained the following role(s): ${roleString}. If you would like to claim perks available to you, please ask in <#870182326901022720>.${erroredString.length > 0 ? `\n\nOh no! Something went wrong while giving you the following role(s): ${erroredString}. Please contact staff for assistance in the support channel.` : ''}`)
                ]
            }).catch(() => {})
        } catch (err) { console.log(err) }
    } else if (erroredRoles.length > 0) {
        let erroredString = ''

        if (erroredRoles.length > 0) {
            erroredRoles.forEach((v, i) => {
                if (erroredRoles.length == 1) {
                    erroredString = v
                    return
                }

                if (i == 1) {
                    erroredString = v
                    return
                }

                if (i < erroredRoles.length) {
                    erroredString += `, ${v}`
                } else {
                    erroredString += ` and ${v}`
                }
            })
        }

        await member.send({ 
            embeds: [
                new MessageEmbed()
                    .setTitle('Uh oh!')
                    .setColor('#ff1111')
                    .setDescription(`Oh no! Something went wrong while giving you the following role(s): ${erroredString}. Please contact staff for assistance in the support channel.`)
            ]
         })
    }
}

donoDb.on('totalUpdate', async (total: number, user: string) => {
    await donoUpdated(total, await (await client.guilds.fetch('784491141022220309')).members.fetch(user), false)
})

donoDb.on('totalUpdateMoney', async (total: number, user: string) => {
    await donoUpdated(total, await (await client.guilds.fetch('784491141022220309')).members.fetch(user), true)
})