import { MessageEmbed } from "discord.js"
import { Inventory } from "../../dbInterfaces/objects/Inventory.js"
import { Item } from "../../dbInterfaces/objects/ItemInterface.js"
import { coinSymbol } from "../../economy.js"
import { CoinItem } from "../internal/Coin.js"
import { UnknownItem } from "../internal/unknown.js"

export function generateLoot(lootTable: Loot[], maxWeight: number): Map<Item, number> {
    const generatedLoot: Map<Item, number> = new Map<Item, number>()
    const maxItems = Math.floor(Math.random() * (maxWeight / 2)) + 1
    let totalWeight = 0

    for (const loot of lootTable) {
        if (loot instanceof CoinLoot) {
            // generate coins
            const amount = Math.floor(Math.random() * loot.maxAmount) + loot.minAmount
            // totalWeight += loot.weight * amount

            generatedLoot.set(loot.item, amount)
            break
        }
    }

    // actually generate items now
    while (maxItems > generateLoot.length && maxWeight > totalWeight) {
        const item = lootTable[Math.floor(Math.random() * lootTable.length)]
        
        if ((item instanceof CoinLoot) == false && lootRng(item.chance)) {
            const amount = Math.floor(Math.random() * item.maxAmount) + 1
            totalWeight += item.weight * amount

            generatedLoot.set(item.item, amount)
        }
    }

    return generatedLoot
}

export function genLootEmbed(boxName: string, loot: Map<Item, number>, count?: number): MessageEmbed {
    const emb = new MessageEmbed()
    let str = ""

    emb.setTitle(count && count > 0 ? `Opened ${prettify(count)}x ${boxName}` : `Opened ${boxName}`)
    emb.setColor(0x00FF00)
    emb.setTimestamp()

    for (const item of loot) {

        if (item[0] instanceof CoinItem) {
            str = `- \`${coinSymbol} ${prettify(item[1])}\`\n` + str
        } else {
            str += `- x${item[1]} ${item[0].emoji} **${item[0].name}**\n`
        }
    }

    emb.setDescription((`Box Contents:\n${str}`).trim())
    return emb
}

// useless helper function lmao
export function putIntoInventory(items: Map<Item, number>, inv: Inventory) {
    items.forEach(async (v, k) => {
        if (k instanceof CoinItem) {
            await inv.addToWalletBalance(v)
        } else {
            await inv.giveItem(k, v)
        }
    })
}

export function prettify(num: number): string {
    return Intl.NumberFormat('en-US').format(num)
}

export class Loot {
    weight: number
    item: Item
    chance: number
    maxAmount: number

    constructor(item: Item, weight: number, chance: number, maxAmount: number) {
        this.item = item
        this.weight = weight
        this.chance = chance
        this.maxAmount = maxAmount
    }
}

const fixedCoinWeight = 0.1

export class CoinLoot implements Loot {
    weight: number = fixedCoinWeight
    chance: number;
    minAmount: number
    maxAmount: number;
    item: Item = Object.freeze(new CoinItem())

    constructor(chance: number, minAmount: number, maxAmount: number) {
        this.chance = chance
        this.minAmount = minAmount
        this.maxAmount = maxAmount
    }
}

export function lootRng(chance: number) {
    let rand = Math.random()
    return rand < (chance / 100) ? true : false
}