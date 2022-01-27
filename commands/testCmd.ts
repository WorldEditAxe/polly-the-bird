// An example command used to show how to use the bot framework.

import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Permissions } from "discord.js";
import { Logger } from "../lib/logger.js";
import { CommandPreprocessor } from "../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../lib/preprocessor/cooldownDate.js";

// Preprocessor Options

// This is a command preprocessor option export.
// This is used to specify what is required in order to run this command.
// This export is optional.
export const preprocessorOptions = new CommandPreprocessor({
    // Use this to set the cooldown of the command. The below line sets a 10 second cooldown.
    cooldown: new CooldownDate({ seconds: 10 }),

    // Set the required permissions for this command.
    requiredPermissions: [Permissions.FLAGS.SEND_MESSAGES],

    // Set the required bot permissions for this command.
    botPermissions: [Permissions.FLAGS.SEND_MESSAGES],

    // Set this to true if the command can only be used in a server.
    serverOnly: true,

    // Set this to true if you want to save the cooldown in the database.
    // This just saves the cooldown data to either SQLite or MongoDB (can be changed in environment variables!)
    // In layman's terms, cooldown data will be retained after the bot is restarted.
    saveCooldownInDb: false
})

// Slash command data

// This specifies the slash command data.
// This is required for the bot to be registered as a command by the framework!
export const slashCommand = new SlashCommandBuilder()
    .setName('helloworld') // All characters must be lowercase!
    .setDescription("An example command.")
    .addStringOption(o => o.setName('name').setDescription("The name of the person to say hello to.").setRequired(true))

// Command executor

// This export is used to specify the function to be executed wghen the command is run.
// Passed variables: CommandInteraction, Client
export async function execute(i: CommandInteraction, client: Client) {
    await i.reply(`Hello there, ${i.options.getString('name')}!`)
}

// Basic logging

// Want to log info to console? Use this class. You get highlighting and much more!
// It is primitive but still does the job.
const logger = new Logger("ExampleLogger")

// We want our logger to log debug information.
// Usually, the bot hides debug if the startup flag --verbose-logging is not passed.
logger.verbose = true

// There are multiple types of logging levels available.
logger.info("Use this to log general info!")
logger.warn("Use this to log warnings!")
logger.error("Use this to log errors!")
logger.fatal("Use this to log fatal errors! Errors are considered fatal if the bot cannot continue running due to an error.")
logger.debug("Use this to log debug information! Debug information are very specific and should only be used for data you usually won't want to see.")
logger.debug("This type of logging does NOT show up in console by default!")

// Static block functions

// This export is ran when the command is loaded.
export async function staticBlock() {
    // Whenever you need to access the client, access it through global.bot.djsClient.
    const client: Client = global.bot.djsClient

    // Do stuff with the client here.
    client.on('messageCreate', async m => {
        if (m.content.toLowerCase().includes("hello, bot!")) {
            await m.reply("Hello there!")
        }
    })
}

// The bot framework provides you with a lot of basic features.
// Edit the command above as you please!