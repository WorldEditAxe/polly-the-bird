import { Client, User } from "discord.js"
import { fetchInventory, updateCache } from "../../economy.js"
import { addItem, addOneItem, addToBank, addToWallet, clearInventory, fetchAttributes, fetchBankBalance, fetchUserInventory, fetchWalletBalance, getItemCount, removeFromBank, removeFromWallet, setBankBalance, setWalletBalance, takeItem, takeOneItem, updateAttributes } from "../../economyApi.js"
import { invSchema, saveInventory } from "../mongoDriver.js"
import { Item } from "./ItemInterface.js"

export class Inventory {
    private userId: string
    saveVersion: number

    constructor(raw: typeof invSchema) {
        this.userId = raw.user_id
        this.saveVersion = raw.save_version
    }

    // getters
    public getOwnerId(): string { return this.userId }
    public async getOwnerAsUser(): Promise<User> { return await (global.bot.djsClient as Client).users.fetch(this.userId) }
    public getSaveVersion(): number { return this.saveVersion }

    public async getWalletBalance(): Promise<number> { return await fetchWalletBalance(this.userId) }
    public async getBankBalance(): Promise<number> { return await fetchBankBalance(this.userId) }
    
    public async setWalletBalance(newAmount: number) {
        await setWalletBalance(this.userId, newAmount)
    }
    public async addToWalletBalance(amt: number): Promise<number> {
        return await addToWallet(this.userId, amt)
    }
    public async removeFromWalletBalance(amt: number): Promise<number> {
        return await removeFromWallet(this.userId, amt)
    }

    public async setBankBalance(newAmount: number) {
        await setBankBalance(this.userId, newAmount)
    }
    public async addToBankBalance(amt: number): Promise<number> {
        return await addToBank(this.userId, amt)
    }
    public async removeFromBankBalance(amt: number): Promise<number> {
        return await removeFromBank(this.userId, amt)
    }

    public async getItemInventory(): Promise<ReadonlyMap<Item, number>> {
        return await fetchUserInventory(this.userId)
    }
    public async clearInventory() {
        await clearInventory(this.userId)
    }
    public async getItemCount(item: Item): Promise<number> {
        const count = await getItemCount(this.userId, item)
        return count ? count : 0
    }
    public async takeOneItem(item: Item): Promise<number> {
        return await takeOneItem(this.userId, item)
    }
    public async takeItem(item: Item, amount: number): Promise<number> {
        return await takeItem(this.userId, item, amount)
    }
    public async giveOneItem(item: Item): Promise<number> {
        return await addOneItem(this.userId, item)
    }
    public async giveItem(item: Item, count: number): Promise<number> {
        return await addItem(this.userId, item, count)
    }

    public async getAttribute(name: string): Promise<any> {
        return await (await fetchAttributes(this.userId)).get(name)
    }
    public async saveAttribute(name: string, value: any) {
        await updateAttributes(this.userId, new Map(await fetchAttributes(this.userId)).set(name, value))
    }
    
    // raw getters
    public async fetchRawAttributes(): Promise<ReadonlyMap<string, any>> {
        return fetchAttributes(this.userId)
    }
    public async fetchRawInvSchema(): Promise<Readonly<typeof invSchema>> {
        return fetchInventory(this.userId)
    }
    public async updateInvSchema(newSchema: typeof invSchema) {
        await updateCache(this.userId, newSchema)
        await saveInventory(this.userId, newSchema)
    }
    public async updateAttributes(newAttributes: Map<string, any>) {
        await updateAttributes(this.userId, newAttributes)
    }
}