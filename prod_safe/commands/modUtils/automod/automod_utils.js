import * as decancer from 'decancer';
import { MessageEmbed } from 'discord.js';
import { compareTwoStrings } from 'string-similarity';
import { analyzeComment } from './api-wrapper.js';
// Some utilities to help with moderation.
export const DISALLOWED_PHRASES = [
    'nigga',
    'nigger',
    'niger'
];
const dc = decancer;
const LOGGING_CHANNEL_ID = '992988890510135306';
const perspectiveToken = process.env.PERSPECTIVE_TOKEN;
const SEND_DC_STRING_TOL = 0.6;
const OFFENSIVE_TOL = 0.75;
const chan = await global.bot.djsClient.channels.fetch(LOGGING_CHANNEL_ID);
export function decancerString(dirty) {
    return dc.default(dirty);
}
export function getCleanForm(str) {
    return str.replace(/[[:punct:]]|[^a-zA-Z0-9\ ]/gmi, "");
}
export function unleetspeak(str) {
    return str
        .replace(/@|4/gmi, 'a')
        .replace(/¢|\xA9/gmi, 'c')
        .replace(/3/gmi, 'e')
        .replace(/6|8/gmi, 'g')
        .replace(/1|!/gmi, 'i')
        .replace(/\|_|\|/gmi, 'l')
        .replace(/Ⓡ|®/gmi, 'r')
        .replace(/0/gmi, 'o')
        .replace(/5|$/gmi, 's')
        .replace(/7/gmi, 't')
        .replace(/vv/gmi, 'w')
        .replace(/¥|￥/gmi, 'y')
        .replace(/2/gmi, 'z')
        .toLowerCase();
}
export function cleanString(dirty, isNick) {
    let appendAfk = false;
    if (isNick && dirty.startsWith("[AFK] ")) {
        appendAfk = true;
        dirty = dirty.replace('[AFK] ', '');
    }
    const clean = getCleanForm(decancerString(dirty)), percentSimilar = compareTwoStrings(clean.toLowerCase(), dirty.toLowerCase());
    if (percentSimilar < SEND_DC_STRING_TOL)
        return appendAfk ? "[AFK] " + clean : clean;
    else
        return appendAfk ? "[AFK] " + dirty : dirty;
}
export async function isStringOffensive(text) {
    const cleanState = getCleanForm(decancerString(text));
    if (cleanState.length <= 0)
        return false;
    const req = await analyzeComment(cleanState, perspectiveToken, {
        requested_attributes: {
            SEVERE_TOXICITY: {
                score_type: 'PROBABILITY',
                score_threshold: 0
            },
            SEXUALLY_EXPLICIT: {
                score_type: 'PROBABILITY',
                score_threshold: 0
            }
        },
        languages: ['en']
    });
    return req.attributeScores.SEVERE_TOXICITY.summaryScore.value > OFFENSIVE_TOL || req.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value > OFFENSIVE_TOL;
}
// this is simple and may be inaccurate but works 99% of the time
export function isStringDirty(text, customFilter) {
    const clean = unleetspeak(cleanString(text));
    return DISALLOWED_PHRASES.some(phrase => clean.includes(phrase)) || DISALLOWED_PHRASES.some(phrase => clean.includes(phrase));
}
export async function logModerationAction(actionType, target, reason, moderator, extraFields) {
    await chan.send({
        embeds: [
            new MessageEmbed()
                .setColor('#df5252')
                .setTitle(actionType)
                .addFields([
                { name: "Offender", value: `**${target.tag}** (\`${target.id}\`)`, inline: true },
                { name: "Reason", value: reason || "<no reason provided>", inline: true },
                { name: "Moderator", value: moderator ? `**${moderator.tag}** (\`${target.id}\`)` : "System", inline: true },
                ...extraFields
            ])
                .setTimestamp()
        ]
    });
}
//# sourceMappingURL=automod_utils.js.map