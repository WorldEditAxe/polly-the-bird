import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { handleError } from "../errorLogger.js";
import { isStringDirty } from "./automod/automod_utils.js";
import { lockDown } from "./lockdown.js";
let heistMode = false;
export function setHeistMode(newMode) { heistMode = newMode; }
const welcomeChannel = '870193314413019216', goodbyeChannel = '784529738491625473';
const SAEF_ID = '957561893961224233';
const client = global.bot.djsClient;
const chan = await client.channels.fetch(welcomeChannel), goodbyeChan = await client.channels.fetch(goodbyeChannel), guild = chan.guild;
const cachedWelcomeEmbed = new MessageEmbed(), cachedHeistEmbed = new MessageEmbed(), cachedPingRoleEmbed = new MessageEmbed();
let str = '';
str += `— <#787343840108478474>: Read the rules\n— <#939984413733847130>: Get some self roles\n— <#863437182131503134>: Check out our grinder perks\n— <#870182326901022720>: Get some help here\n\n`;
str += "__**More Info:**__\n";
cachedPingRoleEmbed
    .setTitle("Ping Roles")
    .setColor('#34c0eb')
    .setDescription("Below are a list of self roles. Click to select them - it's that easy!");
cachedWelcomeEmbed
    .setTitle('Welcome to Dank Merchants!')
    .setDescription("Welcome to Dank Merchants! We hope you enjoy your stay.\nIf you do get banned, please join our appeal server using this [link](https://discord.gg/NgmrJd6v). **Do NOT open a ticket without a valid reason - you will get banned!**\n\nIf you have any questions, please ask them in <#870182326901022720>.")
    .addFields({ name: 'Important - Verify', value: "Please verify your account by reacting on [this message](https://discord.com/channels/784491141022220309/894756748911603742/926102111819796480) with the animated check mark.", inline: true }, { name: 'Reaction Roles', value: "We have plenty of reaction roles you can choose from - please check them out. They are at <#939984413733847130>! Please note you are required to verify in order to access these channels." })
    .setColor('#46d0ee');
cachedHeistEmbed
    .setTitle("Active Heist")
    .setDescription("There is currently an active heist. Please verify your account in <#894756748911603742> and feel free to join!\n\nPlease note that freeloading is NOT allowed and will result in a permanent ban!")
    .setColor('#f2da2d');
// ban simptard
const members = await (await client.guilds.fetch('784491141022220309')).members.fetch();
const simptard = members.filter(m => m.id == SAEF_ID)[0];
if (simptard != undefined) {
    console.log("found simptard")
    await simptard.kick().catch(() => { });
}
client.on('guildMemberAdd', async (m) => {
    if (Date.now() - m.user.createdAt.getTime() <= 2678000000 || lockDown || isStringDirty(m.user.username))
        return;
    if (m.id === SAEF_ID) {
        await m.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Uh oh!")
                    .setDescription("One or more issues have prevented checking of your account (child process died). Please try again.")
                    .setColor('#ff0000')
                    .setTimestamp()
            ]
        }).catch(() => { });
        await m.kick("An issue preventing verification of this user has occurred.");
    }
    if (!heistMode) {
        // no heist mode 
        let embString = str + '';
        embString += `Account Creation: <t:${Math.ceil(m.user.createdTimestamp / 1000)}:R>\n`;
        embString += `User ID: ${m.user.id}`;
        await chan.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Welcome to __**Dank Merchants**__!`)
                    .setColor('#39c212')
                    .setThumbnail(m.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`Welcome to **Dank Merchants**, <@${m.id}>!\n` + embString)
                    .setTimestamp()
            ]
        });
        await dmUser(m.user);
    }
    else {
        // heist mode
        await dmUser(m.user);
        await chan.send(`<@${m.id}> has joined our server during a heist - it is at <#931590909500481538>!`);
    }
});
client.on('guildMemberRemove', async (m) => {
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
        });
    }
});
client.on('interactionCreate', async (e) => {
    if (!e.isButton())
        return;
    if (e.customId.startsWith('ar-'))
        await handleRoleInteraction(e);
});
async function handleRoleInteraction(event) {
    try {
        await event.deferReply({ ephemeral: true });
        let mbr;
        try {
            mbr = await guild.members.fetch(event.user.id);
        }
        catch (_a) {
            await event.editReply("how do you expect me to give you a role when you're not in the server").catch();
            return;
        }
        try {
            let hasRole;
            switch (event.customId) {
                default:
                    await event.editReply("I honestly don't know how you got here but congrats");
                    break;
                case 'ar-coinbomb':
                    hasRole = mbr.roles.cache.has('785726276652105748');
                    await mbr.roles[hasRole ? 'remove' : 'add']('785726276652105748');
                    await event.editReply(hasRole ? "Removed the role 'coin bomb' from you." : "I gave you the role 'coin bomb'.");
                    break;
                case 'ar-events':
                    hasRole = mbr.roles.cache.has('925228998492061806');
                    await mbr.roles[hasRole ? 'remove' : 'add']('925228998492061806');
                    await event.editReply(hasRole ? "Removed the role 'events' from you." : "I gave you the role 'event'.");
                    break;
                case 'ar-giveaways':
                    hasRole = mbr.roles.cache.has('925237811144171621');
                    await mbr.roles[hasRole ? 'remove' : 'add']('925237811144171621');
                    await event.editReply(hasRole ? "Removed the role 'giveaways' from you." : "I gave you the role 'giveaways'.");
                    break;
                case 'ar-heists':
                    hasRole = mbr.roles.cache.has('868937524008083476');
                    await mbr.roles[hasRole ? 'remove' : 'add']('868937524008083476');
                    await event.editReply(hasRole ? "Removed the role 'heists' from you." : "I gave you the role 'heists'.");
                    break;
                case 'ar-lottery':
                    hasRole = mbr.roles.cache.has('785726281832595518');
                    await mbr.roles[hasRole ? 'remove' : 'add']('785726281832595518');
                    await event.editReply(hasRole ? "Removed the role 'lottery' from you." : "I gave you the role 'lottery'.");
                    break;
                case 'ar-ngiveaways':
                    hasRole = mbr.roles.cache.has('891690634585456681');
                    await mbr.roles[hasRole ? 'remove' : 'add']('891690634585456681');
                    await event.editReply(hasRole ? "Removed the role 'nitro giveaways' from you." : "I gave you the role 'nitro giveaways'.");
                    break;
                case 'ar-sgiveaways':
                    hasRole = mbr.roles.cache.has('891690994024730675');
                    await mbr.roles[hasRole ? 'remove' : 'add']('891690994024730675');
                    await event.editReply(hasRole ? "Removed the role 'small giveaways' from you." : "I gave you the role 'small giveaways'.");
                    break;
            }
        }
        catch (err) {
            handleError(err);
            await event.editReply("Something went wrong :thinking:\nMaybe try again?");
        }
    }
    catch (err) {
        handleError(err);
    }
}
async function dmUser(user) {
    try {
        try {
            await user.createDM();
        }
        catch (_a) { }
        await user.send({
            embeds: heistMode ? [cachedHeistEmbed, cachedWelcomeEmbed, cachedPingRoleEmbed] : [cachedWelcomeEmbed, cachedPingRoleEmbed],
            components: [
                new MessageActionRow()
                    .addComponents(new MessageButton()
                    .setEmoji("<a:Giveaway:865935820375457812>")
                    .setStyle('PRIMARY')
                    .setLabel("Events")
                    .setCustomId('ar-events'), new MessageButton()
                    .setEmoji("<a:EE_rheist:860620411980873728>")
                    .setStyle('PRIMARY')
                    .setLabel("Heists")
                    .setCustomId('ar-heists'), new MessageButton()
                    .setEmoji("<:dank_lotteryticket:832856450816671755>")
                    .setStyle('PRIMARY')
                    .setLabel("Lottery")
                    .setCustomId('ar-lottery'), new MessageButton()
                    .setEmoji("<:EE_rrCoinbomb:767785781535572010>")
                    .setStyle('PRIMARY')
                    .setLabel("Coin Bomb")
                    .setCustomId('ar-coinbomb'), new MessageButton()
                    .setEmoji("<:party:804938775682613268>")
                    .setStyle('PRIMARY')
                    .setLabel("Small Giveaways")
                    .setCustomId('ar-sgiveaways')),
                new MessageActionRow()
                    .addComponents(new MessageButton()
                    .setEmoji("<a:nitro:808550935306698762>")
                    .setStyle('PRIMARY')
                    .setLabel("Nitro Giveaways")
                    .setCustomId('ar-ngiveaways'), new MessageButton()
                    .setEmoji("<:giveaways:919591350243033118>")
                    .setStyle('PRIMARY')
                    .setLabel("Giveaways")
                    .setCustomId('ar-giveaways'))
            ]
        });
    }
    catch (e) { }
}
//# sourceMappingURL=welcome.js.map