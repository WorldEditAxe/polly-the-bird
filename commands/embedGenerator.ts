import { MessageEmbed } from "discord.js";

export function getErrorEmbed(msg: string): MessageEmbed {
    return new MessageEmbed()
        .setTitle("Error")
        .setDescription(msg)
        .setTimestamp()
        .setColor('#e63939')
}

export function getSuccessEmbed(msg: string): MessageEmbed {
    return new MessageEmbed()
        .setTitle("Success")
        .setDescription(msg)
        .setTimestamp()
        .setColor('#32a852')
}