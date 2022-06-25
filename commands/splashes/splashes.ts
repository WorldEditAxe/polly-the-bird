import { Client } from "discord.js";
import { readFile } from "fs/promises";

const client: Client = global.bot.djsClient
const splashes = (await readFile("./splashes.txt")).toString().split(/\n/g)
const baseTime = 30 * 1000, minMulti = 0.75, maxMulti = 1.25

function randRange(min: number, max: number, int?: boolean): number {
    return int ? Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min)) : Math.random() * (max - min) + min
}

async function splashLoop() {
    while (true) {
        await client.user.setActivity({
            name: splashes[randRange(1, splashes.length, true) - 1],
            type: 'COMPETING'
        })
        await new Promise(res => setTimeout(res, Math.floor(baseTime * randRange(minMulti, maxMulti))))
    }
}

splashLoop()