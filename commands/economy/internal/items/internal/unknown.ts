import { CommandInteraction, CacheType, User } from "discord.js";
import { Item } from "../../dbInterfaces/objects/ItemInterface.js";

export class UnknownItem implements Item {
    classType: "economyItem" = "economyItem"
    name: string = "Unknown Item"
    description: string = "A developer item. Used to define an unknown item."
    price: number = 69
    sellPrice: number = 420
    id: string = "unknownItem"
    emoji: string = ":question:"
    purchasable: boolean = false
    sellable: boolean = false
    usable: boolean = false
    emojiDefault?: boolean = false
    onUsed = null

    internal = true
}