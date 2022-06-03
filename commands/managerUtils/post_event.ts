import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageEmbed, TextChannel, User } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";
import { awaitStart, getGlobalPersistentDb } from "../database.js";
import { prettify } from "../donations/donoDb.js";
import { parseTimeString } from "../fun/timer/timerDb.js";

await awaitStart()

const authRoles = ['791516116710064159', '791516118120267806']
const cooldownInMs = 3600000
const cooldowns = (await getGlobalPersistentDb()).collection("post_event_cooldowns")

const nameMappings = {
    "SKRIBBL": "Skribbl.io",
    "GTN_100": "Guess the Number (1-100)",
    "GTN_1000": "Guess the Number (1-1000)",
    "MAFIA": "Mafia",
    "MIXED_TEA": "Mixed Tea",
    "GREEN_TEA": "Green Tea",
    "BLACK_TEA": "Black Tea",
    "YELLOW_TEA": "Yellow Tea",
    "RED_TEA": "Red Tea",
    "RUMBLE_ROYALE": "Rumble Royale (FFA)",
    "PAPER_IO": "Paper.io",
    "UNO": "UNO (<@!403419413904228352>)",
    "OTHER": "Other"
}

const imageMappings = {
    "SKRIBBL": "https://cdn.discordapp.com/attachments/745495711981764741/950168583714009128/Untitled270_20220220163620.png",
    "GTN_100": "https://cdn.discordapp.com/attachments/745495711981764741/950168584599011348/Untitled270_20220220165855.png",
    "GTN_1000": "https://cdn.discordapp.com/attachments/745495711981764741/950168584808710184/Untitled270_20220220165810.png",
    "MAFIA": "https://cdn.discordapp.com/attachments/745495711981764741/950168585093926932/Untitled270_20220219225851.png",
    "MIXED_TEA": "https://cdn.discordapp.com/attachments/745495711981764741/950168585316233246/Untitled261_20220104224910.png",
    "GREEN_TEA": "https://cdn.discordapp.com/attachments/745495711981764741/950168585530114048/Untitled261_20220104153110.png",
    "BLACK_TEA": "https://cdn.discordapp.com/attachments/745495711981764741/950168585756618752/Untitled261_20220104163051.png",
    "YELLOW_TEA": "https://cdn.discordapp.com/attachments/745495711981764741/950168586020864040/Untitled261_20220104163628.png",
    "RED_TEA": "https://cdn.discordapp.com/attachments/745495711981764741/950168586280919110/Untitled261_20220104163643.png",
    "RUMBLE_ROYALE": "https://cdn.discordapp.com/attachments/745495711981764741/957148824860758066/Untitled270_20220319184818.png",
    "PAPER_IO": "https://cdn.discordapp.com/attachments/745495711981764741/957148847321280522/03B3C61E-1207-430E-98FE-297A136F46B2.png"
}

export const preprocessorOptions = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 1 }),
    saveCooldownInDb: true,
    serverOnly: true
})

export const slashCommand = new SlashCommandBuilder()
    .setName("event")
    .setDescription("Post an event")
    .addStringOption(o => o.setName("type").setDescription("The type of the event").setRequired(true)
        .addChoices([
            ['Events > Skribbl.io', 'SKRIBBL'],
            ['Events > Guess the Number (1-100)', 'GTN_100'],
            ['Events > Guess the Number (1-1000)', 'GTN_1000'],
            ['Events > Mafia', 'MAFIA'],
            ['Events > Mixed Tea', 'MIXED_TEA'],
            ['Events > Green Tea', 'GREEN_TEA'],
            ['Events > Black Tea', 'BLACK_TEA'],
            ['Events > Yellow Tea', 'YELLOW_TEA'],
            ['Events > Red Tea', 'RED_TEA'],
            ['Events > Rumble Royale (FFA)', 'RUMBLE_ROYALE'],
            ['Events > Paper.io', 'PAPER_IO'],
            ['Events > UNO (Bot)', 'UNO'],
            ['Events > Other', 'OTHER']
        ]))
    .addStringOption(o => o.setName("description").setDescription("The event description. Use {ret} for a new line!").setRequired(true))
    .addStringOption(o => o.setName("prize").setDescription("The prize of the event. Use {ret} for a new line!").setRequired(true))
    .addStringOption(o => o.setName("time").setDescription("How long will the event start from now").setRequired(true))
    .addIntegerOption(o => o.setName("reacts_to_start").setDescription("How much reactions to get for the event to start").setRequired(true))
    .addUserOption(o => o.setName("donor").setDescription("The donor of the event").setRequired(false))

export async function execute(i: CommandInteraction) {
    if (!(i.member as GuildMember).roles.cache.some(v => authRoles.includes(v.id))) {
        await i.reply({ content: "You are not authorized to run this command!", ephemeral: true })
        return
    }

    const fetched = await cooldowns.findOne({ cd: "pec" }) || { cd: "pec", availTimeStamp: 0 }

    if (Math.floor(Date.now() / 1000) <= fetched.availTimeStamp) {
        await i.reply({ content: `Unable to post event: This command is on a global cooldown. This command will become reusable in <t:${fetched.availTimeStamp}:R>.`, ephemeral: true })
        return
    }

    // options
    let type: 'SKRIBBL' | 'GTN_100' | 'GTN_1000' | 'MAFIA' | 'MIXED_TEA' | 'GREEN_TEA' | 'BLACK_TEA' | 'YELLOW_TEA' | 'RED_TEA' | 'RUMBLE_ROYALE' = i.options.getString("type") as any,
         description = i.options.getString("description").replace(/{ret}/gi, "\n"),
         prize = i.options.getString("prize").replace(/{ret}/gi, "\n"),
         time: string | number = i.options.getString("time"),
         donor: User | GuildMember = i.options.getUser("donor"),
         reactsToStart: number = i.options.getInteger("reacts_to_start")

    // validity checks
    if (description.length > 250) {
        await i.reply({ content: "`description` must be less than 250 characters!", ephemeral: true })
        return
    }
    if (prize.length > 250) {
        await i.reply({ content: "`prize` must be less than 250 characters!", ephemeral: true })
        return
    }
    if ((time as any).length > 30) {
        await i.reply({ content: "`time` must be less than 30 characters!", ephemeral: true })
        return
    }
    if (reactsToStart > 50) {
        await i.reply({ content: "The hell do you need so much people for?? Set `reacts_to_start` to a value below 50.", ephemeral: true })
    }

    try {
        time = Math.floor(Date.now() / 1000) + parseTimeString(time as string)
    } catch (err) {
        await i.reply({ content: `Failed to parse time!\n${err}`, ephemeral: true })
        return
    }
    
    await i.deferReply()

    if (donor) donor = await i.guild.members.fetch(donor.id)
    let emb = new MessageEmbed()
    const channel = await i.guild.channels.fetch('870198964635467787')

    // init embed
    emb.setColor('#fcba03')
        .setImage(imageMappings[type])
        .setTitle("Event")
        .setAuthor({ name: (i.member as GuildMember).displayName, iconURL: (i.member as GuildMember).displayAvatarURL() })
        .addFields([
            { name: 'Event Type', value: nameMappings[type], inline: true },
            { name: 'Description', value: description, inline: true },
            { name: 'Prize(s)', value: prize, inline: true },
            { name: 'Starting In', value: `<t:${time}:R>`, inline: true },
            { name: "Reacts to Start", value: `\`${prettify(reactsToStart)}\``, inline: true }
        ])
        
        .setFooter(`Manager ID: ${(i.member as GuildMember).id} | Images by axi#3078`)
        .setTimestamp()

    if (donor) emb.addField('Donor', `<@${donor.id}> (${(donor as GuildMember).user.tag}, id: ${donor.id})\nThank the donor in <#870193314413019216>`, true )

    await (channel as TextChannel).send({
        embeds: [emb],
        content: '<@&925228998492061806>'
    })

    await i.editReply("Successfully sent event, go check it out!")
    await cooldowns.updateOne(
        { cd: "pec" }, 
        { $set: { cd: "pec", availTimeStamp: Math.floor((Date.now() + cooldownInMs) / 1000) } },
        { upsert: true })
}