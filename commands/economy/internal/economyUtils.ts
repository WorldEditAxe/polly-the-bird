import { Item } from "./dbInterfaces/objects/ItemInterface.js";

export function fetchItemString(item: Item, bold?: boolean): string {
    return `${bold == false ? "": "**"}${item.emoji} ${item.name}${bold == false? "" : "**"}`;
}