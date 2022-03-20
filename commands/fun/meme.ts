import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import * as https from 'node:https'
import { CommandPreprocessor } from '../../lib/preprocessor/commandPreprocessor.js'
import { CooldownDate } from '../../lib/preprocessor/cooldownDate.js'

let memeCache: Array<any>
const uri = 'https://www.reddit.com/r/memes/top.json?count=100'
const wait = ms => new Promise<void>(res => setTimeout(res, ms))
let errored = false

export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 3 }),
    saveCooldownInDb: true
})

async function fetch(url: string) {
    const options = { headers: { 'User-Agent': `Polly/1.0 (POLLY SAYS HI)` } } 

    return new Promise<string>((resolve, rej) => {
        let app = ''
        https.get(url, options, res => {
            if (res.statusCode == 404) rej(new Error("404: Not found"))
            if (res.statusCode == 401) rej(new Error("401: Unauthorized"))

            res.on('error', err => rej(err))
            res.on('data', d => app += d)
            res.on('end', () => resolve(app))
        })
    })
}

function parse(json: string) {
    const ret = new Array<{ name: string, author: string, media: string }>()
    const obj = JSON.parse(json).data.children as []

    for (const ent of obj) {
        const dat = (ent as any).data
        ret.push({ name: dat.title, author: dat.author_fullname, media: dat.url_overridden_by_dest })
    }

    return ret
}

export const slashCommand = new SlashCommandBuilder()
    .setName('meme')
    .setDescription('gimme some of that juicy memes from Reddit')

export async function execute(i: CommandInteraction) {
    if (errored) return await i.reply({ content: "The command appears to be broken... maybe try again later?", ephemeral: true })
    const index = Math.floor(Math.random() * memeCache.length)
    const meme: { name: string, author: string, media: string } = memeCache[index]

    await i.reply({
        embeds: [
            new MessageEmbed()
                .setColor('#e1eb34')
                .setTitle(meme.name)
                [meme.media.startsWith('https://v.redd.it') ? 'setDescription' : 'setImage'](meme.media.startsWith('https://v.redd.it') ? `[<offsite video>](${meme.media})` : meme.media)
                .setTimestamp()
        ]
    })
}

// loop
async function loop() {
    while (true) {
        try { memeCache = parse(await fetch(uri)) }
        catch { errored = true; break; }

        await wait(60 * 1000 * 60 * 1)
    }
}

export async function staticBlock() {
    loop()
}