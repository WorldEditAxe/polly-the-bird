// the list of gay people in this server
// jazzy, saef, and pinkiest
import { SlashCommandBuilder } from "@discordjs/builders";
const WHITELISTED_ROLES = ['791516118120267806'];
function convertStringToEmotes(text) {
    let constructedString = '';
    for (const char of text) {
        switch (char) {
            default:
                constructedString += char;
                break;
            case 'a':
                constructedString += '<a:CS_AlphabetA:774659690503471144>';
                break;
            case 'b':
                constructedString += '<a:CS_AlphabetB:774659695092301844>';
                break;
            case 'c':
                constructedString += '<a:CS_AlphabetC:774659699399589918>';
                break;
            case 'd':
                constructedString += '<a:CS_AlphabetD:774659710392467476>';
                break;
            case 'e':
                constructedString += '<a:CS_AlphabetE:774659714717712415>';
                break;
            case 'f':
                constructedString += '<a:CS_AlphabetF:774659719268139018>';
                break;
            case 'g':
                constructedString += '<a:CS_AlphabetG:774659731612237856>';
                break;
            case 'h':
                constructedString += '<a:CS_AlphabetH:774659736413929492>';
                break;
            case 'i':
                constructedString += '<a:CS_AlphabetI:774659741422059577>';
                break;
            case 'j':
                constructedString += '<a:CS_AlphabetJ:774659752994668594>';
                break;
            case 'k':
                constructedString += '<a:CS_AlphabetK:774659757415858206>';
                break;
            case 'l':
                constructedString += '<a:CS_AlphabetL:774659761702436874>';
                break;
            case 'm':
                constructedString += '<a:CS_AlphabetM:774659774259658752>';
                break;
            case 'n':
                constructedString += '<a:CS_AlphabetN:774659778584379432>';
                break;
            case 'o':
                constructedString += '<a:CS_AlphabetO:774659783475068959>';
                break;
            case 'p':
                constructedString += '<a:CS_AlphabetP:774659795524911114>';
                break;
            case 'q':
                constructedString += '<a:CS_AlphabetQ:774659801514901514>';
                break;
            case 'r':
                constructedString += '<a:CS_AlphabetR:774659806111858708>';
                break;
            case 's':
                constructedString += '<a:CS_AlphabetS:774659816760016926>';
                break;
            case 't':
                constructedString += '<a:CS_AlphabetT:774659822691942432>';
                break;
            case 'u':
                constructedString += '<a:CS_AlphabetU:774659827497566208>';
                break;
            case 'v':
                constructedString += '<a:CS_AlphabetV:774659837635461131>';
                break;
            case 'w':
                constructedString += '<a:CS_AlphabetW:774659842107244564>';
                break;
            case 'x':
                constructedString += '<a:CS_AlphabetX:774659846149898270>';
                break;
            case 'y':
                constructedString += '<a:CS_AlphabetY:774659859663683625>';
                break;
            case 'z':
                constructedString += '<a:CS_AlphabetZ:774659864387256340>';
                break;
        }
    }
    return constructedString;
}
export const slashCommand = new SlashCommandBuilder()
    .setName("emojify")
    .setDescription("Converts a string into use animated emojis.")
    .addStringOption(o => o
    .setName("text")
    .setDescription("The text to emojify. Do NOT put any emojis in there - it will also get emojified!")
    .setRequired(true));
export async function execute(i) {
    if (!WHITELISTED_ROLES.some(role => i.member.roles.cache.has(role)))
        return await i.reply({ content: "You do not have permission to use this command!", ephemeral: true });
    if (i.options.getString('text').length * 35 * 2 + 33 > 2000)
        return await i.reply({ content: "That string is too long for me to send due to Discord limitations. Sorry!" });
    const emojified = convertStringToEmotes(i.options.getString('text'));
    await i.reply(`Preview: ${emojified}\nEscaped form:\n\`\`\`\n${emojified}\n\`\`\``);
}
//# sourceMappingURL=emojify.js.map