import { SlashCommandBuilder } from "@discordjs/builders";
import { Permissions } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";
export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 1 }),
    saveCooldownInDb: true,
    serverOnly: true
});
export const slashCommand = new SlashCommandBuilder()
    .setName('dump')
    .setDescription('Dumps the list of members with the specified role, or the entire server if there isn\'t any.')
    .addRoleOption(o => o.setName('role').setDescription('The role to dump.').setRequired(false));
export async function execute(i) {
    var _a;
    if (!i.guild)
        return await i.reply({ content: 'You can\'t run this command outside of a server??', ephemeral: true });
    if (!i.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES))
        return await i.reply({ content: 'You are missing the permission "Manage Roles" required to use that command.', ephemeral: true });
    await i.deferReply();
    const role = (_a = i.options.getRole('role')) !== null && _a !== void 0 ? _a : i.guild.roles.everyone;
    const members = (await i.guild.members.fetch()).filter(m => m.roles.cache.has(role.id));
    if (members.size === 0)
        return await i.reply({ content: 'There are no members with that role, kinda sad', ephemeral: true });
    let sendString = `Dump of ${members.size} members with the role ${role.name.startsWith('@') ? '' : '@'}${role.name}\nDate Dumped: ${new Date().toUTCString()}\n--------------------------------\n`;
    members.forEach(m => sendString += `${m.user.tag} (ID: ${m.id}, join date: ${m.user.createdAt.toUTCString()})\n`);
    if (sendString.length < 2975) {
        await i.editReply({ content: '```\n' + sendString + "\n```" });
    }
    else {
        // send as attachment
        try {
            await i.editReply({
                files: [{
                        attachment: Buffer.from(sendString),
                        name: `dump_${role.name}_${new Date().toISOString()}.txt`
                    }]
            });
        }
        catch (e) {
            await i.editReply({ content: 'There was an error sending the file. Make sure I have permissions to attach files, and that the file is not too big.' });
        }
    }
}
//# sourceMappingURL=dump.js.map