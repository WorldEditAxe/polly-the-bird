import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const slashCommand = new SlashCommandBuilder()
    .setName('pilly')
    .setDescription('Pilly vs Polly: who will win??')

export async function execute(i: CommandInteraction) {
    await i.reply("**Today's sponsor for this ~~video~~ boxing match is sponsored by ur mum! Download ur mum at https://example.com**"
                + "\n*Polly:* I will beat cho ass up Pilly"
                + "\n*Pilly:* no u"
                + "\nPilly proceeds to pull out his UNO®️ reverse card and beats his ass, killing him in the progress."
                + "\n*Polly:* nOOoOooOoOO yOu cAn'T uSe A uNo®️ rEverSe cAr-"
                + "\n*Pilly:* DIE BITCH DEI  DIEDIE0D JEIDJEIDJEIDJEI DJE"
                + "\nK.O. bitches")
}