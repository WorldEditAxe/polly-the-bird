import { CommandInteraction, CacheType, User } from "discord.js";
import { Item } from "../../dbInterfaces/objects/ItemInterface.js";

export class CoinItem implements Item {
    classType: "economyItem" = "economyItem"
    name: string = "Coin"
    description: string = "An abstract item used internally."
    price: number = 1
    sellPrice: number = 1
    id: string = "Coin"
    emoji: string = "🪙"
    purchasable: boolean = false
    sellable: boolean = false
    usable: boolean = false
    emojiDefault?: boolean = true
    onUsed = undefined

    internal = true
}