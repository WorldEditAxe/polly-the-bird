import { MessageEmbed, TextChannel } from "discord.js";

const EMBED_COLORS = '#43a2e6'

/*
<a:giveaway:933814322403082290> <@&925228998492061806>
<a:EE_rheist:860620411980873728> <@&868937524008083476>
<:winninglotteryticket:889800122555326485> <@&785726281832595518>
<:EE_rrCoinbomb:767785781535572010> <@&785726276652105748>
<:party:804938775682613268> <@&891690994024730675>
<a:nitro:964275784468541491> <@&891690634585456681>
<:giveaways:919523314282672149> <@&925237811144171621>
*/

async function generateAndSendEmbeds(channel: TextChannel) {

    const COLOR_ROLE_MSG = await channel.send({
        embeds: [
            new MessageEmbed()
                .setTitle("Color Roles")
                .setColor(EMBED_COLORS)
                .setDescription(
                    "❤️ ⨯ <@&784897971010404362>\n"
                    + "💙 ⨯ <@&784897977265291267> \n"
                    + "💚 ⨯ <@&784897981505732608>\n"
                    + "💛 ⨯ <@&784900208056074261>\n"
                    + "💜 ⨯ <@&785203575047192657>\n"
                    + "💗 ⨯ <@&784900699027931137>\n"
                    + "🌀 ⨯ <@&785201531205058614>\n"
                    + "🧡 ⨯ <@&784899395375726592>"
                )
        ]
    })

    const COLOR_ROLE_AMARIED_MSG = await channel.send({
        embeds: [
            new MessageEmbed()
                .setTitle("More Color Roles")
                .setColor(EMBED_COLORS)
                .setDescription("These color roles require you to have an Amari level of 10 or higher.\n"
                    + "🤖 <@&785198611368771584>\n"
                    + "🌈 <@&788738306770206790>\n"
                    + "☕ <@&785201530240106576>\n"
                    + "🔷 <@&785202757489524746>\n"
                    + "🌇 <@&785202759175503892>\n"
                    + "🌹 <@&785198634807066624>\n"
                    + "🟣 <@&785198633376022548>\n"
                    + "🔵 <@&785198634819518474>\n"
                    + "🐷 <@&785201533344153621>\n"
                    + "🐖 <@&785202756465852437>\n"
                    + "🤎 <@&785202755261825065>\n"
                    + "🍾 <@&785198635960369152\n"
                    + "🧊 <@&784550784809172992>\n"
                    + "💎 <@&785203573738700810>")

        ]
    })

    const 
}