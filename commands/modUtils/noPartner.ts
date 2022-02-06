import { Client, MessageEmbed, TextChannel } from "discord.js";

const client: Client = global.bot.djsClient
const message = await (await client.channels.fetch('870276752440692776') as TextChannel).messages.fetch('874472954518454292')
const collector = message.createReactionCollector({ dispose: true })

collector.on('collect', async (e, usr) => {
    if (!e.message.guild) return
    if (e.message.id != '874472954518454292') return

    // no partner
    const member = await e.message.guild.members.fetch(usr.id)
    if (e.emoji.id == '793151158281175064' && (member.roles.cache.has('784549344225263646') || member.roles.cache.has('785201531656994837'))) {
        await member.roles.remove('796889400667275324')
            .then(async () => {
                await member.createDM().catch()
                await member.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Uh oh!')
                            .setColor('#b8130d')
                            .setDescription("You can't receive that role. If you have the 'Partner' or 'Partnered Heist' roles, please remove these roles and try again.")
                            .setTimestamp()
                        ]
                }).catch()

            }).catch()
        
        await e.users.remove(usr.id).catch()
        return
    } else if ((e.emoji.id == '817473785950371881' || e.emoji.id == '861300228803002368') && member.roles.cache.has('796889400667275324')) {
        try {
            if (e.emoji.id == '817473785950371881') await member.roles.remove('817473785950371881')
            else await member.roles.remove('861300228803002368')
        } catch {
            // do nothing
            return
        } finally {
            await member.createDM().catch()
            await member.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Uh oh!')
                        .setColor('#b8130d')
                        .setDescription("You can't receive that role. If you have the 'No Partnership' role, please remove that role and try again.")
                        .setTimestamp()
                ]
            }).catch()

            await e.users.remove(usr.id).catch()
        }

        return
    } else if (e.emoji.id == '817473785950371881') {
        await member.roles.add('784549344225263646').catch()
    }
})

collector.on('remove', async (e, user) => {
    if (!e.message.guild) return
    if (e.message.id != '874472954518454292') return
    const member = await e.message.guild.members.fetch(user.id)

    if (e.emoji.id == '817473785950371881') {
        await member.roles.remove('784549344225263646').catch()
    }
})