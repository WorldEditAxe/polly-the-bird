import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Permissions } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";
export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 }),
    serverOnly: true
});
export const slashCommand = new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks the channel')
    .addBooleanOption(o => o.setName('unlock').setDescription('Sets whether to unlock the channel or not').setRequired(false))
    .addChannelOption(o => o.setName('channel').setDescription('The channel to lock.').setRequired(false));
const memberRole = '784529268881227796';
export async function execute(i) {
    var _a;
    if (!i.guild)
        return i.reply({ content: 'I think this should be kinda obvious but you can\'t lock your DMs', ephemeral: true });
    if (!i.memberPermissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
        return i.reply({ content: 'You are missing the permission "Manage Channels" required to use that command.', ephemeral: true });
    const lock = i.options.getBoolean('unlock') ? false : true;
    const channel = (_a = i.options.getChannel('channel')) !== null && _a !== void 0 ? _a : i.channel;
    if (!channel.permissionsFor(i.guild.me).has(Permissions.FLAGS.MANAGE_CHANNELS))
        return i.reply({ content: 'I don\'t have the permission "Manage Channels" to lock this channel.', ephemeral: true });
    // lock channel
    if (lock) {
        await channel.permissionOverwrites.create(i.guild.roles.everyone, { SEND_MESSAGES: false, SEND_MESSAGES_IN_THREADS: false, CREATE_PRIVATE_THREADS: false, CREATE_PUBLIC_THREADS: false });
        return await i.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#80ff00')
                    .setDescription(`<:tick:930664226677227581> | Successfully locked down channel <#${channel.id}>.`)
                    .setTimestamp()
            ]
        });
    }
    else {
        try {
            await channel.permissionOverwrites.delete(i.guild.roles.everyone);
            return await i.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#80ff00')
                        .setDescription(`<:tick:930664226677227581> | Successfully locked down channel <#${channel.id}>.`)
                        .setTimestamp()
                ]
            });
        }
        catch (e) {
            await i.reply({ content: 'The channel hasn\'t been locked down yet.', ephemeral: true });
        }
    }
}
//# sourceMappingURL=lock.js.map