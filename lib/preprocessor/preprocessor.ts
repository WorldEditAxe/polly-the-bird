import { CommandInteraction, Permissions } from "discord.js";
import { cooldownMap } from "../../index.js";
import { CommandPreprocessor } from "./commandPreprocessor.js";
import { getCooldown, setCooldown } from "./cooldownDb.js";

/**
 * Preprocesses a command execution request.
 * @param i The command interaction object.
 * @param commandName The name of the command.
 * @param preprocessor The preprocessor object of the command.
 * @param privateGuildId The guild ID of the private guild, if the command is private.
 * @returns A string containing the error message, if any.
 */
export async function preprocess(i: CommandInteraction, commandName: string, preprocessor: CommandPreprocessor, privateGuildId: string): Promise<string | undefined> {
    // guild check
    if (!i.guild && preprocessor.serverOnly) return "This command is guild/server only!"
    
    // required permissions
    if (i.guild && preprocessor.requiredPermissions && !i.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        let missingPerms: string[] = []

        for (const perm of preprocessor.requiredPermissions) {
            if (!i.memberPermissions.has(perm as bigint)) missingPerms.push(new Permissions(perm as bigint).toArray()[0])
        }

        if (missingPerms.length > 0) {
            
            let missingPermString = "", index = 0

            for (const perm of missingPerms) {
                index++
                if (index < missingPerms.length && index == missingPerms.length - 1) {
                    missingPermString += `${perm}, and `
                } else if (index < missingPerms.length) {
                    missingPermString += `${perm}, `
                } else {
                    missingPermString += `\`${perm}\``
                }
            }

            return `You are missing the following permission(s) to run this command: ${missingPermString}. If you believe this is in error, please contact a server administrator.`
        }
    }

    if (i.guild && preprocessor.botPermissions && !i.guild.me.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        let missingPerms: string[] = []

        for (const perm of preprocessor.botPermissions) {
            if (!i.guild.me.permissions.has(perm as bigint)) missingPerms.push(new Permissions(perm as bigint).toArray()[0])
        }

        if (missingPerms.length > 0) {
            
            let missingPermString = "", index = 0

            for (const perm of missingPerms) {
                index++
                if (index < missingPerms.length && index == missingPerms.length - 1) {
                    missingPermString += `${perm}, and `
                } else if (index < missingPerms.length) {
                    missingPermString += `${perm}, `
                } else {
                    missingPermString += `\`${perm}\``
                }
            }

            return `The bot is missing the following permission(s) to run this command: ${missingPermString}. If you are a server`
                + " administrator, please check the bot's permissions and try again."
        }
    }

    // cooldowns
    if (preprocessor.saveCooldownInDb) {
        if (preprocessor.cooldown) {
            const cooldown = await getCooldown(privateGuildId ? `${privateGuildId}_${commandName}` : commandName, i.user.id)
                , time = Math.floor(Date.now() / 1000)
            
            if (cooldown > time) {
                return `This command is on cooldown.\nYou may use this command in <t:${cooldown}:R>.`
            } else {
                await setCooldown(privateGuildId ? `${privateGuildId}_${commandName}` : commandName, i.user.id, time + preprocessor.cooldown)
            }
        }
    } else {
        const arr = cooldownMap.get(privateGuildId ? `${privateGuildId}_${commandName}` : commandName)
            , val = arr.get(i.user.id)
            , time = Math.floor(Date.now() / 1000)

        if (!val) {
            arr.set(i.user.id, time + preprocessor.cooldown)
        } else {
            if (val > time) {
                return `This command is on cooldown.\nYou may use this command again in <t:${val}:R>.`
            } else {
                arr.set(i.user.id, time + preprocessor.cooldown)
                arr.delete(i.user.id)
            }
        }
    }

    return undefined
}