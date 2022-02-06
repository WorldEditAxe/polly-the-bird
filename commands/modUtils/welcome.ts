import { Client, MessageEmbed, TextChannel, User } from "discord.js"
import { lockDown } from "./lockdown.js"

let heistMode = false

export function setHeistMode(newMode: boolean) { heistMode = newMode }

const welcomeChannel = '870193314413019216', goodbyeChannel = '784529738491625473'

const client: Client = global.bot.djsClient 
const chan = await client.channels.fetch(welcomeChannel) as TextChannel, goodbyeChan = await client.channels.fetch(goodbyeChannel) as TextChannel

const cachedWelcomeEmbed = new MessageEmbed(), cachedHeistEmbed = new MessageEmbed()

let str = ''
str += `— <#787343840108478474>: Read the rules\n— <#871011445092024350>, <#870276752440692776>, <#874588416812142612>: Get some self roles\n— <#863437182131503134>: Check out our grinder perks\n— <#870182326901022720>: Get some help here\n\n`
str += "__**More Info:**__\n"

cachedWelcomeEmbed
    .setTitle('Welcome to Dank Merchants!')
    .setDescription("Welcome to Dank Merchants! We hope you enjoy your stay.\nIf you do get banned, please join our appeal server using this [link](https://discord.gg/4YgdCPmWvM). **Do NOT open a ticket without a valid reason - you will get banned!**\n\nIf you have any questions, please ask them in <#870182326901022720>.")
    .addFields(
        { name: 'Important - Verify', value: "Please verify your account by reacting on [this message](https://discord.com/channels/784491141022220309/894756748911603742/926102111819796480) with the animated check mark.", inline: true },
        { name: 'Reaction Roles', value: "We have plenty of reaction roles you can choose from - please check them out. They are at <#871011445092024350>, <#870276752440692776>, <#874588416812142612>! Please note you are required to verify in order to access these channels." },
    )
    .setColor('#46d0ee')

cachedHeistEmbed
        .setTitle("Active Heist")
        .setDescription("There is currently an active heist. Please verify your account in <#894756748911603742> and feel free to join!\n\nPlease note that freeloading is NOT allowed and will result in a permanent ban!")
        .setColor('#f2da2d')

client.on('guildMemberAdd', async m => {
    if (Date.now() - m.user.createdAt.getTime() <= 2678000000 || lockDown) return

    if (!heistMode) {
        // no heist mode 
        let embString = str + ''

        embString += `Account Creation: <t:${Math.ceil(m.user.createdTimestamp / 1000)}:R>\n`
        embString += `User ID: ${m.user.id}`

        await chan.send({
            embeds: [
                new MessageEmbed()  
                    .setTitle(`Welcome to __**Dank Merchants**__!`)
                    .setColor('#39c212')
                    .setThumbnail(m.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`Welcome to **Dank Merchants**, <@${m.id}>!\n` + embString)
                    .setTimestamp()
            ]
        })
        
        await dmUser(m.user)

    } else {
        // heist mode
        await dmUser(m.user)
        await chan.send(`<@${m.id}> has joined our server during a heist - it is at <#931590909500481538>!`)
    }
})

client.on('guildMemberRemove', async m => {
    // TODO: add freeloader autoban
    if (!heistMode) {
        await goodbyeChan.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Goodbye ${m.user.username}`)
                    .setColor('#0080ff')
                    .setThumbnail(m.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`It seems like ${m.displayName} has left us. We hope you had a great time!`)
                    .setTimestamp()
            ]
        })
    }
})

async function dmUser(user: User) {
    try {
        try { await user.createDM() } catch {}
        await user.send({
            embeds: heistMode ? [ cachedHeistEmbed, cachedWelcomeEmbed ] : [ cachedWelcomeEmbed ]
        })
    } catch {}
}