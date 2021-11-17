import * as dotenv from "dotenv"
import { Client, CommandInteraction, GuildMember, Intents, Interaction, MemberMention, MessageEmbed, Permissions } from "discord.js"
import { REST } from "@discordjs/rest"
import * as fs from "fs"
import { Logger } from "./lib/logger.js"
import { SlashCommandBuilder } from "@discordjs/builders"
import { Routes } from "discord-api-types/v9"
import { randomUUID } from "crypto"
dotenv.config()

const client: Client = new Client({ intents: [new Intents(32767)] })
const token = process.env.TOKEN
    , devGuildId = process.env.DEV_GUILD_ID
    , isProd = process.env.IS_PRODUCTION
const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const logger: Logger = new Logger("INDEX")
const commandHash: Map<String, any> = new Map<String, any>()

const startTimer: number = Date.now()
logger.info("Starting bot...")
if (isProd != undefined && isProd != null) {
    if (isProd.toLocaleLowerCase() == "false") {
        logger.warn("Bot is in non-production mode. Commands will be updated to a separate guild and not globally.")
    }
}
logger.info("Logging in..")
await client.login(token)
    .catch(err => {
        logger.fatal("Failed to login to Discord: " + err.stack)
        process.exit(1)
    })

global.bot = {}
global.bot.commandMap = commandHash
global.bot.botToken = token
global.bot.isProduction = getIsProd()
global.bot.clientId = client.application.id
global.bot.djsClient = client

logger.info("Loading commands..")
await initCommands()

for (const cmd of commandHash) {
    if (cmd[1].onRegister != undefined) {
        try {
            await cmd[1].onRegister()
        } catch (err) {
            logger.error("An error was thrown whilst executing a onRegister() method from a command: \n" + err.stack)
        }
    }
}
client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return
    for (const cmd of commandHash) {
        if (interaction.commandName == cmd[0]) {
            try {
                await cmd[1].execute(interaction, client)
                return
            } catch (err) {
                const errId: string = randomUUID()
                const embed: MessageEmbed = new MessageEmbed()
                embed.setColor('#eb4034')
                embed.setDescription(`Oops! It looks like something went wrong while running that command.
                Error code: \`${errId}\``)
                embed.setTimestamp()
                logger.error(`Something went wrong while executing a command (ID: ${errId}):\n${err.stack}`)
                try {
                    if (interaction.replied) {
                        await interaction.editReply({ embeds: [embed] })
                    } else {
                        await interaction.reply({ embeds: [embed] })
                    }
                    return
                } catch (ignored) { }
            }
        }
    }
    try {
        const e = new MessageEmbed()
        e.setColor('#eb4034')
        e.setDescription(`Unknown command - "${interaction.commandName}". \nPlease double-check your spelling. For developers, check that the command is loaded.`)
        e.setTimestamp()
        if (interaction.replied) {
            await interaction.editReply({ embeds: [e] })
        } else {
            await interaction.reply({ embeds: [e] })
        }
    } catch (ignored) { }
})
const endTimer: number = Date.now()
const elapsedTime: number = (endTimer - startTimer) / 1000
logger.info(`Done (${elapsedTime.toFixed(2)}s)!`)






// functions
async function walk(path: string): Promise<void> {
    const files: string[] = fs.readdirSync(path)
    if (files == undefined) {
        return
    }
    for (const val of files) {
        let dir: string = path + "/" + val
        if (fs.statSync(dir).isDirectory()) {
            await walk(dir)
        } else {
            if (dir.endsWith(".js") || dir.endsWith(".ts") || dir.endsWith(".tsx")) {
                const imp = await import(dir)

                if (imp.staticBlock != undefined) {
                    try {
                        await imp.staticBlock()
                    } catch (err) {
                        logger.error(`An error was thrown whilst executing a static() method from a file: \n${err.stack}`)
                    }
                }

                if (imp.slashCommand != undefined && imp.execute != undefined) {
                    if (imp.slashCommand.name == undefined || imp.slashCommand.name == null) {
                        logger.error("Cannot register slash command: Slash command name is null or undefined!")
                    }
                    if (commandHash.has(imp.slashCommand.name)) {
                        logger.error("Cannot register slash command: Slash command name \"" + imp.slashCommand.name + "\" is already being used.")
                    } else {
                        commandHash.set(imp.slashCommand.name, imp)
                        logger.debug("Registered slash command \"" + imp.slashCommand.name + "\".")
                    }
                } else {
                    logger.debug(`File \"${dir}\" will not be loaded as it is either missing a slashCommand variable or execute method.`)
                }
            }
        }
    }
}

async function regCommands(guildId?: string) {
    const cmds: SlashCommandBuilder[] = []
    for (const cmd of commandHash) {
        cmds.push(cmd[1].slashCommand)
    }
    const rest = new REST({ version: '9' }).setToken(token)

    const cmdJson: any[] = cmds.map(command => command.toJSON())
    if (guildId != undefined) {
        await client.application.fetch()
        let route: any = Routes.applicationGuildCommands(client.application.id, guildId)
        await rest.put(route, { body: cmdJson })
            .catch(reason => {
                throw new Error("Failed to register slash commands to guild! Error: "
                    + reason)
            })
    } else {
        let route: any = Routes.applicationCommands(client.application.id)
        await rest.put(route, { body: cmdJson })
            .catch(reason => {
                throw new Error("Failed to register slash commands globally! Error: "
                    + reason) })
            })
    }
}

async function initCommands() {
    await walk("./commands/")
    if (isProd != undefined) {
        if (isProd.toLocaleLowerCase() == "true") {
            try {
                await regCommands()
            } catch (err) {
                logger.error(`Failed to register slash commands! Error:\n${err.stack}`)
                process.exit(1)
            }
        } else if (isProd.toLocaleLowerCase() == "false") {
            try {
                await regCommands(devGuildId)
            } catch (err) {
                logger.error(`Failed to register slash commands! Error:\n${err.stack}`)
                process.exit(1)
            }
        } else {
            logger.error("Environment variable \"IS_PRODUCTION\" must be either one of these values: true, false.")
            process.exit(1)
        }
    } else {
        await regCommands()
    }
}

function getIsProd(): boolean {
    if (isProd != undefined) {
        if (isProd.toLocaleLowerCase() == "true") {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}
