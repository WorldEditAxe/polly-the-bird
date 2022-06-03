/*
    A minigame (soon to be added into Polly)

    Concept:
    - Command is ran in channel
    - 6 tries to finish
    - Players vote on letter to guess
*/

import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, Collector, CommandInteraction, GuildChannel, GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, Permissions, TextChannel, User } from "discord.js";
import { randomUUID } from "node:crypto";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";

const playingChannels: Array<string> = new Array()

// TODO: do when??

type game$gameOptions = {
    host: User,
    channel: TextChannel,
    word: string
}

type game$gameState = {
    failed: boolean,
    guessedCorrectLetters: string[],
    guessedIncorrectLetters: string[],
    word: string,
    state: 'PLAYING' | 'LOST' | 'WON'
}

type game$rendererOptions = {
    message: string
}

// sprites are ordered like this: 1st mistake, 2nd, 3rd, ...
const sprites: string[] = ["         +---+\n          |      |\n                 |\n                 |\n                 |\n                 |\n=========",
                           "         +---+\n          |      |\n         O     |\n                 |\n                 |\n                 |\n=========",
                           "         +---+\n          |       |\n         O      |\n          |       |\n                  |\n                  |\n=========",
                           "         +---+\n          |       |\n         O      |\n        /|       |\n                  |\n                  |\n=========",
                           "         +---+\n             |   |\n           O   |\n          /|\  |\n                  |\n                  |\n=========",
                           "        +---+\n             |   |\n            O  |\n          /|\  |\n           /    |\n                  |\n=========",
                           "         +---+\n             |   |\n           O   |\n          /|\  |\n          / \  |\n                  |\n========="]

async function runGame(msg: Message, word: string, players: GuildMember[]) {
    const chan = msg.channel as TextChannel
    const gameState: game$gameState = {
        failed: false,
        guessedCorrectLetters: [],
        guessedIncorrectLetters: [],
        word: word,
        state: "PLAYING"
    }

    while (!gameState.failed) {
        await chan.send({
            embeds: [
                renderEmbed(gameState, { message: "You have **30 seconds** to vote on a letter. To vote, send `p!vote <letter>` in the channel." })
            ]
        })
        const msgCollector = chan.createMessageCollector({ time: 30000, filter: m => players.includes(m.member) })
        let votes: Map<string, string> = new Map()

        msgCollector.on('collect', async msg => {
            if (!msg.content.toLowerCase().startsWith('p!vote ')) return
            if (!players.includes(msg.member)) {
                await msg.reply("You're not playing in this game!")
                return
            }
            if (votes.has(msg.author.id)) {
                await await msg.reply("You already voted for a letter!").catch(() => {})
                return
            }
            else {
                // parse
                const letter = msg.content.split(' ')
                if (letter.length < 2) return
                if (letter[1].length > 1 || letter[1].length < 1) {
                    await msg.reply("Please give me a letter. The letter you gave me is too long.").catch(() => {})
                    return
                }
                if (!/^[a-zA-Z]+$/.test(letter[1])) {
                    await msg.reply("The letter must be a Latin character (a-z, not case sensitive)!")
                    return
                }
                if (gameState.guessedCorrectLetters.includes(letter[1].toLowerCase()) || gameState.guessedIncorrectLetters.includes(letter[1].toLowerCase())) {
                    await msg.reply("This letter was already guessed!")
                    return
                }
                votes.set(msg.author.id, letter[1].toLowerCase())
                await msg.reply(`Set your letter vote to \`${letter[1].toUpperCase()}\`!`)
            }
        })
        
        await new Promise<void>(async (res, rej) => {
            msgCollector.on('end', async () => {
                const vtes: Map<string, number> = new Map()
                
                votes.forEach((v, k) => {
                    vtes.set(v, vtes.get(v) || 1)
                })

                // TODO: work on when?
                res()
            })
        })
    }
    // TODO: add handling for game end
}

export function renderEmbed(state: game$gameState, options?: game$rendererOptions): MessageEmbed {
    // TODO: work on renderer
    const ret = new MessageEmbed()
    const msg = options ? options.message ? "\n" + options.message : "\n" : "\n"

    if (state.failed) {
        ret.setColor('RED')
        // clamp incorrect letter length
        ret.setDescription(`**Game Over!**\n${msg}\nThe word was \`${state.word}\`.`)
    } else {
        if (state.state == 'LOST') {

        } else if (state.state == 'PLAYING') {
            ret.setColor('#fcba03')
            ret.setDescription(`**Hangman**\n${msg}`)
        } else if (state.state == 'WON') {
            ret.setColor('RED')
        // clamp incorrect letter length
        ret.setDescription(`**Game Over!**\nThe word was \`${state.word}\`.\n${msg}`)
        }
    }

    ret.addFields({ name: "Chances Left", value: `\`${6 - state.guessedIncorrectLetters.length}\`` })

    if (state.guessedIncorrectLetters.length >= 1) {
        let i = 0
        let addStr: string = ""

        for (const letter of state.guessedIncorrectLetters) {
            i++
            if (i >= state.guessedIncorrectLetters.length) {
                addStr += letter.toUpperCase()
            } else {
                addStr += letter.toUpperCase() + ", "
            }
        }

        ret.addFields({ name: "Incorrect Letters", value: `**${addStr}**`, inline: true })
    } else {
        ret.addFields({ name: "Incorrect Letters", value: "<none>", inline: true })
    }

    if (state.guessedCorrectLetters.length >= 1) {
        let i = 0
        let addStr: string = ""

        for (const letter of state.guessedCorrectLetters) { 
            i++
            if (i >= state.guessedCorrectLetters.length) {
                addStr += letter.toUpperCase()
            } else {
                // TODO: work on
                addStr += letter.toUpperCase() + ", "
            }
        }

        ret.addFields({ name: "Correct Letters", value: `**${addStr}**`, inline: true })
    }

    ret.setTimestamp()
    return ret
}

async function startGameLobby(options: game$gameOptions) {
    const plrs: GuildMember[] = [], joinId = randomUUID()
    const msg = await options.channel.send({
        embeds: [
            new MessageEmbed()
                .setDescription("**A game of Hangman is starting!**\nPress 'Join' to join the game. The game will start in approximately 1 minute.")
                .setColor('#fcba03')
                .setTimestamp()
        ],
        components: [
            new MessageActionRow()
                .addComponents(new MessageButton()
                    .setEmoji('🎮')
                    .setLabel("Join")
                    .setCustomId(`hangman-join-${joinId}`)
                    .setStyle('SUCCESS'))
        ]
    })
    const collector = msg.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 60 * 1000 /* 1 min */, filter: i => i.customId == `hangman-join-${joinId}` })

    collector.on('collect', async i => {
        if (plrs.includes(i.member as GuildMember)) return await i.reply({ content: "You already joined the game, be patient!", ephemeral: true }).catch(() => {})
        plrs.push(i.member as GuildMember)
        await i.reply({ content: "Successfully added you to the game!", ephemeral: true }).catch(() => {})
    })

    collector.on('end', async i => {
        await msg.edit({
            embeds: [
                new MessageEmbed()
                    .setDescription(
                        plrs.length >= 1
                            ? "**A game of Hangman is starting!**\nPress 'Join' to join the game. The game will start in approximately 1 minute.\n**This game already started!**"
                            : "**A game of Hangman is starting!**\nPress 'Join' to join the game. The game will start in approximately 1 minute.\n**Game failed to begin as no one joined.**"
                    )
                    .setColor(plrs.length >= 1 ? '#fcba03' : '#de4040')
                    .setTimestamp()
            ],
            components: [
                new MessageActionRow()
                    .addComponents(new MessageButton()
                        .setEmoji('🎮')
                        .setLabel("Join")
                        .setCustomId(`no u`)
                        .setDisabled(true)
                        .setStyle('SUCCESS'))
            ]
        }).catch(() => {})

        if (plrs.length >= 1) await runGame(msg, options.word, plrs)
    })
}

export const slashCommand = new SlashCommandBuilder()
    .setName("hangman")
    .setDescription("Start a small game of Hangman.")
    .addStringOption(o => o.setName("word").setDescription("The word to guess.").setRequired(true))

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ minutes: 1 }),
    botPermissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL],
    serverOnly: true,
    saveCooldownInDb: true
})

export async function execute(i: CommandInteraction) {
    if (playingChannels[i.channelId]) return await i.reply({ content: "There's already a game active in that channel!", ephemeral: true }).catch(() => {})
    if (i.options.getString("word").length > 20) return await i.reply({ content: `yeah no don't you think ${i.options.getString("word").length} characters a tad bit long`, ephemeral: true }).catch()
    if (!(i.channel as GuildChannel).permissionsFor(i.guild.me).has(Permissions.FLAGS.VIEW_CHANNEL) || !(i.channel as GuildChannel).permissionsFor(i.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) await i.reply({ content: "I am missing either one of the following permissions: `View Channel`, `Send Messages`.\nIf you are a server administrator, please grant me the missing permissions. Thank you!", ephemeral: true })

    await i.reply({ content: "Successfully started a new game!", ephemeral: true })
    await startGameLobby({
        host: i.user,
        channel: i.channel as TextChannel,
        word: i.options.getString("word")
    })
}