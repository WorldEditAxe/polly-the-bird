import { CommandInteraction, User } from "discord.js";
import { Item } from "./ItemInterface.js"

export interface ShipAttachment extends Item {
    "classType": "economyItem"
    name: string
    description: string
    price: number
    sellPrice: number
    id: string
    emoji: string
    purchasable: boolean
    sellable: boolean
    "usable": false
    emojiDefault?: boolean
    onUsed: (interaction: CommandInteraction, user: User, item: Item, amount: number) => boolean | void | Promise<boolean | void>
}