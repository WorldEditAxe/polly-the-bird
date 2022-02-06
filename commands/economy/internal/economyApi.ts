import { invSchema, saveInventory } from "./dbInterfaces/mongoDriver.js";
import { Item } from "./dbInterfaces/objects/ItemInterface.js";
import { fetchInventory, resolveItem, updateCache } from "./economy.js";

// Getters
export async function fetchWalletBalance(usr: string): Promise<Readonly<number>> {
    return (await fetchInventory(usr)).wallet_balance
}

export async function fetchBankBalance(usr: string): Promise<Readonly<number>> {
    return (await fetchInventory(usr)).bank_balance
}

export async function fetchUserInventory(usr: string): Promise<ReadonlyMap<Item, number>> {
    const inv = await fetchInventory(usr)
    const returnMap = new Map<Item, number>()

    for (const item of Object.entries(inv.inventory)) {
        // [0] = item ID, [1] = item count
        returnMap.set(resolveItem(item[0]), item[1] as number)
    }

    return returnMap
}

export async function fetchAttributes(usr: string): Promise<ReadonlyMap<string, any>> {
    return new Map(Object.entries((await fetchInventory(usr)).attributes))
}

// Setters

// Wallet
export async function setWalletBalance(usr: string, newBalance: number) {
    let newInv = { ...await fetchInventory(usr) }
    newInv.wallet_balance = newBalance

    await updateCache(usr, newInv)
    await saveInventory(usr, newInv)
}

export async function addToWallet(usr: string, amount: number): Promise<Readonly<number>> {
    const old = await fetchWalletBalance(usr)
    await setWalletBalance(usr, old + amount)
    
    return old + amount
}

export async function removeFromWallet(usr: string, amount: number): Promise<Readonly<number>> {
    const old = await fetchWalletBalance(usr)
    await setWalletBalance(usr, old - amount)
    
    return old - amount
}

// Bank
export async function setBankBalance(usr: string, newBalance: number) {
    let newInv = { ...await fetchInventory(usr) }
    newInv.bank_balance = newBalance

    await updateCache(usr, newInv)
    await saveInventory(usr, newInv)
}

export async function addToBank(usr: string, amount: number): Promise<Readonly<number>> {
    const old = await fetchBankBalance(usr)
    await setBankBalance(usr, old + amount)

    return old + amount
}

export async function removeFromBank(usr: string, amount: number): Promise<Readonly<number>> {
    const old = await fetchBankBalance(usr)
    await setBankBalance(usr, old - amount)

    return old - amount
}

// Inventory Manipulation
export async function getItemCount(usr: string, item: Item): Promise<Readonly<number>> {
    const itm = resolveItem(item.id)

    const inv = await fetchUserInventory(usr)
    return inv.get(itm) ? inv.get(itm) : 0
}

export async function setItemCount(usr: string, item: Item, count: number) {
    let newInv = { ...await fetchInventory(usr) }
    
    if (count == 0) {
        (newInv.inventory[item.id] as Map<string, number>).delete(item.id)
    } else {
        newInv.inventory[item.id] = count
    }

    await updateCache(usr, newInv)
    await saveInventory(usr, newInv)
}

export async function clearInventory(usr: string) {
    let newInv = { ...await fetchInventory(usr) }
    newInv.inventory = {}

    await updateCache(usr, newInv)
    await saveInventory(usr, newInv)
}

export async function takeItem(usr: string, item: Item, count: number): Promise<Readonly<number>> {
    const old = await getItemCount(usr, item)
    await setItemCount(usr, item, old - count)

    return old - count
}

export async function takeOneItem(usr: string, item: Item): Promise<Readonly<number>> {
    return await takeItem(usr, item, 1)
}

export async function removeItemStack(usr: string, item: Item) {
    await setItemCount(usr, item, 0)
}

export async function addItem(usr: string, item: Item, count: number): Promise<Readonly<number>> {
    const old = await getItemCount(usr, item)
    await setItemCount(usr, item, old + count)

    return old + count
}

export async function addOneItem(usr: string, item: Item): Promise<Readonly<number>> {
    return await addItem(usr, item, 1)
}

// attrib shit idfk
export async function updateAttributes(usr: string, attribs: Map<string, any>) {
    let newInv = { ...await fetchInventory(usr) }
    newInv.attributes = attribs

    await updateCache(usr, newInv)
    await saveInventory(usr, newInv)
}

export async function overwriteSave(usr: string, inv: typeof invSchema) {
    await updateCache(usr, inv)
    await saveInventory(usr, inv)
}