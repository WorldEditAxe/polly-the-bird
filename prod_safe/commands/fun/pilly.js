import { SlashCommandBuilder } from "@discordjs/builders";
export const slashCommand = new SlashCommandBuilder()
    .setName('pilly')
    .setDescription('Pilly vs Polly: who will win??');
export async function execute(i) {
    await i.reply(Math.random() > 0.5 ? "Polly won smfh" : "Pilly won smfh");
}
//# sourceMappingURL=pilly.js.map