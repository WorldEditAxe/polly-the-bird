import { Message } from "discord.js";
import { isOnStarboard, markMessageAsStarred, pinOnStarboard, removeFromStarboard } from "./lib.js";
const client = global.bot.djsClient;
const EMOJI_PIN_ID = '994885114825801748', REMOVE_ID = '994892028271923291', OVERRIDE = '791516118120267806';
const STARBOARD_ID = '994787484913385492';
const REQUIRED_REACTS = 3;
const OK_EMOJI = '✅', NO_EMOJI = '❌', ERROR_EMOJI = '⚠️';
client.on('messageReactionAdd', async (reaction) => {
    if (!reaction.message.guild)
        return;
    reaction.message = reaction.message instanceof Message ? reaction.message : await reaction.message.channel.messages.fetch(reaction.message.id);
    if (reaction.emoji.id == EMOJI_PIN_ID && (reaction.count == REQUIRED_REACTS || await userHasStaff(reaction))) {
        if (!reaction.message.content && reaction.message.embeds.length <= 0 && reaction.message.attachments.size <= 0)
            return;
        const exists = await isOnStarboard(reaction.message.id);
        if (exists)
            await reaction.message.react(NO_EMOJI).catch(() => { });
        else {
            const r = await pinOnStarboard(reaction.message);
            if (r) {
                await markMessageAsStarred(r, reaction.message, reaction.message.channel.id);
                await reaction.message.react(OK_EMOJI).catch(() => { });
            }
            else
                await reaction.message.react(ERROR_EMOJI).catch(() => { });
        }
    }
    else if (reaction.emoji.id == REMOVE_ID && reaction.message.channel.id == STARBOARD_ID && (reaction.count == REQUIRED_REACTS || await userHasStaff(reaction))) {
        await removeFromStarboard(reaction.message);
    }
});
async function userHasStaff(reaction) {
    const reacted = await reaction.message.guild.members.fetch([...reaction.users.cache.values()][reaction.users.cache.size - 1]).catch(() => { });
    if (!reacted)
        return false;
    if (reacted.roles.cache.has(OVERRIDE))
        return true;
    return false;
}
//# sourceMappingURL=bindings.js.map