import { EventEmitter } from "node:events";
import { awaitStart, getDb } from "../database.js";

export const eventBindings = new EventEmitter()
await awaitStart()
export const db = (await getDb('donations')).collection('donations')

export const schema = {
    user_id: "",
    giveaways:  0,
    heists: 0,
    events: 0,
    special: 0,
    money: 0.0
}

export async function fetchDonos(userId: string): Promise<typeof schema> {
    // exists check
    let fetched = await db.findOne({ user_id: userId }) as any
    if (!fetched) {
        const cloned = { ...schema }
        cloned.user_id = userId
        await db.insertOne(cloned)

        return cloned
    }

    return fetched
}

export async function addTo(userId: string, type: 'GIVEAWAYS' | 'HEISTS' | 'EVENTS' | 'SPECIAL' | 'MONEY', amount: number, moderator: string, sub?: boolean) {
    const fetched = await fetchDonos(userId)
    const lowered = type.toLowerCase()

    await db.updateOne({ user_id: userId }, { $inc: { [lowered]: amount } })
    eventBindings.emit(sub ? 'remove' : 'add',  userId, type, sub ? amount + (amount * -2) : amount, fetched[type.toLowerCase()] + amount, moderator)
    
    if (type == 'MONEY') eventBindings.emit('totalUpdateMoney', fetched.money + amount, userId)
    else eventBindings.emit('totalUpdate', fetched.events + fetched.giveaways + fetched.heists + fetched.special + (sub ? amount + (amount * -2) : amount), userId)
}

export async function massInsert(arr: typeof schema[]) {
    await db.insertMany(arr)
}

export async function takeFrom(userId: string, type: 'GIVEAWAYS' | 'HEISTS' | 'EVENTS' | 'SPECIAL' | 'MONEY', amount: number, moderator: string) {
    await addTo(userId, type, amount - (amount * 2), moderator, true)
}

export async function setDono(userId: string, type: 'GIVEAWAYS' | 'HEISTS' | 'EVENTS' | 'SPECIAL' | 'MONEY', amount: number, moderator: string) {
    const fetched = await fetchDonos(userId)
    await db.updateOne({ user_id: userId }, { $set: { [type.toLowerCase()]: amount } })

    eventBindings.emit('set', userId, type, amount, moderator)
    if (type == 'MONEY') eventBindings.emit('totalUpdateMoney', amount, userId)
    else {
        let total = 0, loweredType = type.toLowerCase()

        for (const ent of Object.entries(fetched)) {
            if (ent[0] != loweredType && ent[0] != "user_id" && ent[0] != 'money' && ent[0] != '_id') total += ent[1] as any
        }

        total += amount

        eventBindings.emit('totalUpdate', total, userId)
    }
}

export async function deleteUser(userId: string, moderator: string) {
    await db.findOneAndDelete({ user_id: userId })

    eventBindings.emit('delete', userId, moderator)
    eventBindings.emit('totalUpdate', 0, userId)
    eventBindings.emit('totalUpdateMoney', 0, userId)
}

// utils lol
const instance = Intl.NumberFormat('en-US'), format_money = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const currency_symbol = '⏣'
export function prettify(num: number | bigint, money?: boolean): string { return money ? format_money.format(num) : instance.format(num); }

export function stringize(num: number, money?: boolean) { return `\`${money ? '' : `${currency_symbol} `}${prettify(num, money)}\`` }