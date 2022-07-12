import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import * as https from 'node:https';
import { CommandPreprocessor } from '../../lib/preprocessor/commandPreprocessor.js';
import { CooldownDate } from '../../lib/preprocessor/cooldownDate.js';
let memeCache;
const uri = 'https://www.reddit.com/r/memes/top.json?count=100';
const wait = ms => new Promise(res => setTimeout(res, ms));
let errored = false;
export const preprocessor = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 3 }),
    saveCooldownInDb: true
});
async function fetch(url) {
    const options = { headers: { 'User-Agent': `Polly/1.0 (POLLY SAYS HI)` } };
    return new Promise((resolve, rej) => {
        let app = '';
        https.get(url, options, res => {
            if (res.statusCode == 404)
                rej(new Error("404: Not found"));
            if (res.statusCode == 401)
                rej(new Error("401: Unauthorized"));
            res.on('error', err => rej(err));
            res.on('data', d => app += d);
            res.on('end', () => resolve(app));
        });
    });
}
function parse(json) {
    const ret = new Array();
    const obj = JSON.parse(json).data.children;
    for (const ent of obj) {
        const dat = ent.data;
        ret.push({ name: dat.title, author: dat.author_fullname, media: dat.url_overridden_by_dest });
    }
    return ret;
}
export const slashCommand = new SlashCommandBuilder()
    .setName('meme')
    .setDescription('gimme some of that juicy memes from Reddit');
export async function execute(i) {
    if (errored)
        return await i.reply({ content: "The command appears to be broken... maybe try again later?", ephemeral: true });
    const index = Math.floor(Math.random() * memeCache.length);
    const meme = memeCache[index];
    await i.reply({
        embeds: [
            new MessageEmbed()
                .setColor('#e1eb34')
                .setTitle(meme.name)[meme.media.startsWith('https://v.redd.it') ? 'setDescription' : 'setImage'](meme.media.startsWith('https://v.redd.it') ? `[<offsite video>](${meme.media})` : meme.media)
                .setTimestamp()
        ],
        ephemeral: true
    });
}
// loop
async function loop() {
    while (true) {
        try {
            memeCache = parse(await fetch(uri));
        }
        catch (_a) {
            errored = true;
            break;
        }
        await wait(60 * 1000 * 60 * 1);
    }
}
export async function staticBlock() {
    loop();
}
//# sourceMappingURL=meme.js.map