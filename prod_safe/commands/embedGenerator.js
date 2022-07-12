import { MessageEmbed } from "discord.js";
export function getErrorEmbed(msg) {
    return new MessageEmbed()
        .setTitle("Error")
        .setDescription(msg)
        .setTimestamp()
        .setColor('#e63939');
}
export function getSuccessEmbed(msg) {
    return new MessageEmbed()
        .setTitle("Success")
        .setDescription(msg)
        .setTimestamp()
        .setColor('#32a852');
}
//# sourceMappingURL=embedGenerator.js.map