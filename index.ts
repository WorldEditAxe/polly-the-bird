import * as dotenv from "dotenv"
import { Client, CommandInteraction, GuildMember, Intents, Interaction, MemberMention, MessageEmbed, Permissions } from "discord.js"
import { REST } from "@discordjs/rest"
import * as fs from "fs"
import { Logger, verboseLogging } from "./lib/logger.js"
import { SlashCommandBuilder } from "@discordjs/builders"
import { Routes } from "discord-api-types/v9"
import { randomUUID } from "crypto"
import { CommandPreprocessor } from "./lib/preprocessor/commandPreprocessor.js"
import { preprocess } from "./lib/preprocessor/preprocessor.js"
import { init } from "./lib/preprocessor/cooldownDb.js"
dotenv.config()

export const cooldownMap = new Map<string, Map<string, number>>()

const client: Client = new Client({ intents: [new Intents(32767)] })
let token = process.env.TOKEN
    , devGuildId = process.env.DEV_GUILD_ID
    , isProd = process.env.IS_PRODUCTION
    , cooldownDbType = process.env.COOLDOWN_DB_TYPE ?? 'SQLITE'
    , cooldownDbUri = process.env.COOLDOWN_DB_URI
const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const logger: Logger = new Logger("INDEX")
const commandMap: Map<SlashCommandBuilder, any> = new Map<SlashCommandBuilder, any>()
const privateCommandMap: Map<string, { execute: Function, slashCommand: SlashCommandBuilder, preprocessor?: CommandPreprocessor }[]> = new Map()
const preprocessorMap: Map<string, CommandPreprocessor> = new Map<string, CommandPreprocessor>()


const startTimer: number = Date.now()

process.argv.forEach((v, i) => {
    if (i == 0 || i == 1) return
    let lowered_arg = v.toLowerCase()

    switch(lowered_arg) {
        default:
            logger.fatal(`Unknown startup flag - ${lowered_arg}. Please check the startup flag is spelled correctly, and that the flag actually exists.`)
            process.exit(1)
            break
        case "--verbose-logging":
            verboseLogging(true)
            logger.verbose = true
            logger.debug(`Startup flag --verbose-logging passed. Verbose logging enabled.`)
            break
        case "--help":
            logger.info("List of bot framework startup flags:")
            logger.info("")
            logger.info("   --help: Shows this menu")
            logger.info("   --verbose-logging: Enables debug logging")
            logger.info("   --enable-dev: Force enables developer mode (equivalent to IS_PRODUCTION=false)")
            logger.info("   --disable-dev: Force disables developer mode (equivalent to IS_PRODUCTION=true)")
            logger.info("")
            logger.info("For more documentation, please visit this project's repo at https://github.com/WorldEditAxe/bot-framework.")
            process.exit(0)
            break
        case "--enable-dev":
            isProd = "false"
            
            if (!devGuildId) {
                logger.fatal("Environment variable \"DEV_GUILD_ID\" not passed - cannot enable developer mode!")
                logger.fatal("Exiting!")
                process.exit(1)
            } else {
                logger.warn("Startup flag --enable-dev passed. Enabled developer mode.")
            }

            break
        case "--disable-dev":
            isProd = "true"
            logger.warn("Startup flag --disable-dev passed. Disabled developer mode.")
            break
    }
})

// check startup flags
if (!token) {
    logger.fatal("A Discord bot token must be passed to start the bot!")
    logger.fatal("Halted initialization.")
    process.exit(1)
} else if (isProd.toLowerCase() == "true" && !devGuildId) {
    logger.fatal("Whenever developer mode is turned on, the environment variable DEV_GUILD_ID must pass a valid Discord server ID.")
    logger.fatal("Halted initialization.")
    process.exit(1)
} else {
    if (cooldownDbType.toLowerCase() != 'sqlite' && cooldownDbType.toLowerCase() != 'mongodb') {
        if (!cooldownDbType) {
            cooldownDbType = 'SQLITE'
        } else {
            logger.fatal("Invalid value detected in COOLDOWN_DB_TYPE. | Valid values: SQLITE, MONGODB.")
            logger.fatal("Halted initialization.")
            process.exit(1)
        }
    } else { cooldownDbType = cooldownDbType.toUpperCase() }

    if (cooldownDbType == "MONGODB" && !cooldownDbUri) {
        logger.fatal("Whenever the cooldown database type is MONGODB, the environment variable COOLDOWN_DB_URI must be not-null.")
        logger.fatal("Halted initialization.")
        process.exit(1)
    }
}

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
global.bot.commandMap = commandMap
global.bot.botToken = token
global.bot.isProduction = getIsProd()
global.bot.clientId = client.application.id
global.bot.djsClient = client

logger.info("Loading commands..")
await initCommands()

logger.info(`Finished loading commands and connected to Discord gateway, initing database...`)
logger.info(`Cooldown database wrapper is using database platform ${cooldownDbType == "SQLITE" ? "SQLite" : "MongoDB"}.`)

logger.debug("Loading cooldown mappings...")
logger.debug("Using on-framework cooldown maps and SQLite cooldown databases are strongly discouraged for sharding.")

const initCooldownMap = []

for (const cmd of commandMap) {
    const preproc = preprocessorMap.get(cmd[0].name)

    if (preproc) {
        if (!preproc.saveCooldownInDb) {
            cooldownMap.set(cmd[0].name, new Map<string, number>())
        } else {
            initCooldownMap.push(cmd[0].name)
        } 
    }
}

for (const guild of privateCommandMap) {
    for (const cmd of guild[1]) {
        const cast = cmd as any

        if (cast.preprocessor && !cast.preprocessor.saveCooldownInDb) {
            cooldownMap.set(`${guild[0]}_${cast.slashCommand.name}`, new Map<string, number>())
        } else {
            initCooldownMap.push(`${guild[0]}_${cast.slashCommand.name}`)
        }
    }
}

logger.debug("Loading cooldown database...")
await init(cooldownDbType.toUpperCase() as any, initCooldownMap, cooldownDbUri)
logger.debug("Finished loading of cooldown database.")

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return
    for (const cmd of commandMap) {
        if (interaction.commandName == cmd[0].name) {
            const pObject = preprocessorMap.get(cmd[0].name)

            if (pObject) {
                const res = await preprocess(interaction, cmd[0].name, pObject, undefined)
                if (res) {
                    
                    try {
                        await interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('#ff4f4f')
                                    .setDescription(res)
                                    .setTimestamp()
                            ],
                            ephemeral: true
                        })
                    } catch { return }

                    return
                }
            }

            try {
                await cmd[1](interaction, client)
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
                        await interaction.reply({ embeds: [embed], ephemeral: true })
                    }
                    return
                } catch (ignored) { }
            }
        }
    }

    if (interaction.guild) {
        const guildCmds = privateCommandMap.get(interaction.guild.id)
        if (!guildCmds) return

        for (const cmd of guildCmds) {
            if (interaction.commandName == cmd.slashCommand.name) {
                if (cmd.preprocessor) {
                    const res = await preprocess(interaction, cmd.slashCommand.name, cmd.preprocessor, interaction.guild.id)

                    if (res) {
                        try {
                            await interaction.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor('#ff4f4f')
                                        .setDescription(res)
                                        .setTimestamp()
                                ],
                                ephemeral: true
                            })
                        } catch { return }

                        return
                    }
                }

                try {
                    await cmd.execute(interaction, client)
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
                            await interaction.reply({ embeds: [embed], ephemeral: true })
                        }
                        return
                    } catch (ignored) { }
                }
            }
        }
    }

    try {
        const e = new MessageEmbed()
        e.setColor('#eb4034')
        e.setDescription(`Unknown command - "${interaction.commandName}".\nPlease double-check your spelling. For developers, check that the command is loaded.`)
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
                    if (commandMap.has(imp.slashCommand.name) && !imp.guildRegisterId) {
                        logger.error("Cannot register slash command: Slash command name \"" + imp.slashCommand.name + "\" is already being used.")
                    } else if (privateCommandMap.has(imp.slashCommand.name) && imp.guildRegisterId) {
                        logger.error(`Cannot register guild only slash commands - Slash command name "${imp.slashCommand.name}" is already in use for guild ${imp.guildRegisterId}.`)
                    } else {
                        if (imp.guildRegisterId) {
                            if (!privateCommandMap.has(imp.guildRegisterId)) privateCommandMap.set(imp.guildRegisterId, [])
                            privateCommandMap.get(imp.guildRegisterId).push({ execute: imp.execute, slashCommand: imp.slashCommand, preprocessor: imp.preprocessorOptions })
                            logger.debug(`Successfully loaded private command ${imp.slashCommand.name} for guild ${imp.guildRegisterId}.`)
                        } else {
                            commandMap.set(imp.slashCommand, imp.execute)

                            if (imp.preprocessorOptions != undefined) {
                                preprocessorMap.set(imp.slashCommand.name, imp.preprocessorOptions)
                            }

                            logger.debug(`Successfully loaded slash command ${imp.slashCommand.name}.`)
                        }
                    }
                } else {
                    logger.debug(`File \"${dir}\" will not be loaded as it is either missing a slashCommand variable or execute method.`)
                }
            }
        }
    }
}

async function regCommands(guildId?: string, commands?: SlashCommandBuilder[]) {
    let cmds: SlashCommandBuilder[] = commands ?? undefined

    if (!cmds) {
        cmds = []
        for (const cmd of commandMap) {
            cmds.push(cmd[0])
        }
    }

    const rest = new REST({ version: '9' }).setToken(token)
    let cmdJson: any[] = cmds.map(command => command.toJSON())

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
    }
}

async function initCommands() {
    await walk("./commands/")
    if (isProd != undefined) {
        if (isProd.toLocaleLowerCase() == "true") {
            try {
                
                if (privateCommandMap) {
                    for (const ent of privateCommandMap) {
                        const parsedMap = []

                        ent[1].forEach(v => parsedMap.push(v.slashCommand))
                        
                        await regCommands(ent[0], parsedMap)
                    }
                }

                await regCommands()
            } catch (err) {
                logger.error(`Failed to register slash commands! Error:\n${err.stack}`)
                process.exit(1)
            }
        } else if (isProd.toLocaleLowerCase() == "false") {
            const toDelete = []

            try {
                if (privateCommandMap) {
                    for (const ent of privateCommandMap) {
                        const parsedMap = []

                        ent[1].forEach(v => parsedMap.push(v.slashCommand))
                        
                        if (ent[0] != devGuildId) {
                            await regCommands(ent[0], parsedMap)
                        } else {
                            ent[1].forEach(v => {
                                commandMap.set(v.slashCommand, v.execute)
                                toDelete.push(v.slashCommand.name)
                            })
                        }
                    }
                }

                await regCommands(devGuildId)
                toDelete.forEach(v => {
                    commandMap.forEach((_v, k) => {
                        if (k.name == v) commandMap.delete(k)
                    })
                })
            } catch (err) {
                logger.error(`Failed to register slash commands! Error:\n${err.stack}`)
                process.exit(1)
            }
        } else {
            logger.error("Environment variable \"IS_PRODUCTION\" must be either one of these values: true, false.")
            process.exit(1)
        }
    } else {
        if (privateCommandMap) {
            for (const ent of privateCommandMap) {
                const parsedMap = []

                ent[1].forEach(v => parsedMap.push(v.slashCommand))
                
                await regCommands(ent[0], parsedMap)
            }
        }

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
