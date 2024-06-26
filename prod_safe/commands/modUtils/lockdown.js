import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Permissions } from "discord.js";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";
export let lockDown = false;
export function setLockdown(newValue) { lockDown = newValue; }
export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 1 }),
    serverOnly: true
});
export const slashCommand = new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lockdown the server')
    .addBooleanOption(o => o.setName('enable').setDescription('Enable lockdown mode').setRequired(true));
export async function execute(i) {
    const perms = i.member.permissions;
    if (!perms.has(Permissions.FLAGS.MANAGE_GUILD) && !perms.has(Permissions.FLAGS.KICK_MEMBERS))
        return await i.reply({ content: "You need the permissions 'Manage Server' and 'Kick Members' in order to use this command!", ephemeral: true });
    const mode = i.options.getBoolean('enable');
    lockDown = mode;
    await i.reply({
        embeds: [
            new MessageEmbed()
                .setTitle('Success')
                .setColor('#38f81d')
                .setDescription(`Successfully set lockdown mode to \`${mode}\`!`)
                .setTimestamp()
        ]
    });
}
export async function staticBlock() {
    const client = global.bot.djsClient;
    client.on('guildMemberAdd', async (m) => {
        try {
            if (lockDown) {
                // attempt dm
                try {
                    await m.createDM().catch();
                    await m.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Server Lockdown")
                                .setColor('#ff1515')
                                .setDescription("Uh oh! The server is temporarily locked down. Please try again later.")
                                .setTimestamp()
                        ]
                    });
                }
                catch (_a) { }
                await m.kick("Server locked down | Automated action.");
            }
        }
        catch (_b) { }
    });
}
//# sourceMappingURL=lockdown.js.map