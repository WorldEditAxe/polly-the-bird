import { User } from "discord.js";
import EventEmitter from "node:events";
import { readdir } from "node:fs/promises";
import { resolve } from "path"
import { invSchema, retrieveInventory } from "./dbInterfaces/mongoDriver.js";
import { Inventory } from "./dbInterfaces/objects/Inventory.js";
import { Item } from "./dbInterfaces/objects/ItemInterface.js";
import { get, isCached, set } from "./dbInterfaces/redisDb.js";
import { UnknownItem } from "./items/internal/unknown.js";

const itemRegistry: Map<string, Item> = new Map<string, Item>()
const optionMappings: [string, string][] = []
let loaded = false

export let optMappings

// loaded bindings/events
export const events = new EventEmitter()

// load item registry
async function getFiles(dir): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFiles(res) : [res]
    }))
    return Array.prototype.concat(...files)
}

async function loadItems(dir?: string) {
    const imported = await getFiles(dir ? dir : "./commands/economy/internal/items/")
    const files: string[] = []

    for (const imp of imported) {
        if (imp.endsWith(".js")) {
            files.push(imp)
        }
    }

    for (const file of files) {
        const e: any = Object.values(await import(process.platform === "win32" ? "file://" + resolve(file.replace(/\\/g, "/")) : file))[0] 
            ? Object.values(await import(process.platform === "win32" ? "file://" + resolve(file.replace(/\\/g, "/")) : file))[0] 
            : await import(process.platform === "win32" ? "file://" + resolve(file.replace(/\\/g, "/")) : file)

        const ignored = Object.values(await import(process.platform === "win32" ? "file://" + resolve(file.replace(/\\/g, "/")) : file))[1]

        if (ignored != true) {
            const imported: Item = new e()

            if (imported.classType == "economyItem") {
                if (!itemRegistry.has(imported.id)) {
                    itemRegistry.set(imported.id, imported)

                    if (imported["internal"] != true) { optionMappings.push([ imported.name, imported.id ]) }
                    console.info(`[INFO] Loaded item ${imported.id} into item registry.`)
                } else {
                    console.error(`[ERROR] The item ID ${imported.id} is ambiguous/is being used by two items (existing item: ${itemRegistry.get(imported.id).name}, conflicting item: ${imported.name})!`)
                    console.error(`[ERROR] The economy system has experienced a fatal error and will now exit.`)

                    process.exit(1)
                }
            }
        }
    }
}

export function fetchAbstractInventory(inv: typeof invSchema): Inventory {
    return new Inventory(inv)
}

// mapping calls
export function resolveItem(query: string, checkName?: boolean, disallowDev?: boolean): Item {
    for (const ent of itemRegistry) {
        const id = ent[0]
        const item = ent[1]

        if (checkName) {
            if (query.toLowerCase() == item.name.toLowerCase()) return item
        }

        if (query == item.id) return item
    }
    return new UnknownItem()
} 

export function dbItemResolve(item: Item): Item {
    for (const itm of itemRegistry) {
        if (item.id == itm[0]) return itm[1]
    }
}

export function commandItemResolve(query: string): Item | undefined {
    const resolvedItem = resolveItem(query, true, true)
    return resolvedItem instanceof UnknownItem ? undefined : resolvedItem
}

export async function updateCache(usr: User | string, inv: typeof invSchema) {
    const id = usr instanceof User ? usr.id : usr
    
    if (await !isCached(id)) await set(usr instanceof User ? usr.id : usr, JSON.stringify(inv))
    await set(id, JSON.stringify(inv))
}

export async function fetchInventory(usr: User | string): Promise<typeof invSchema> {
    const id = usr instanceof User ? usr.id : usr

    if (!await isCached(id)) await set(id, JSON.stringify(await retrieveInventory(id)))
    return JSON.parse(await get(usr instanceof User ? usr.id : usr)) as typeof invSchema
}

export async function staticBlock() {
    if (!loaded) {
        await loadItems()
        optMappings = optionMappings    
    }
}

// random utils
export const coinSymbol = '⌬'
export function prettify(num: number): string {
    return Intl.NumberFormat('en-US').format(num)
}

export function fetchItemOptionMappings() {
    return optionMappings
}

export function itemMisspellAutocorrect(query: string): string {
    for (const item of itemRegistry) {
        let resolved

        if (compareTwoStrings(query.toLowerCase(), item[1].name.toLowerCase()) > 0.8) {
            resolved = item[1].name
        } else if (compareTwoStrings(query.toLowerCase(), item[1].id.toLowerCase()) > 0.8) {
            resolved = item[1].id 
        }

        if (item[1]["internal"] == true) return undefined
        else return resolved
    }

    return undefined
}

function compareTwoStrings(first, second) {
	first = first.replace(/\s+/g, '')
	second = second.replace(/\s+/g, '')

	if (first === second) return 1; // identical or empty
	if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

	let firstBigrams = new Map();
	for (let i = 0; i < first.length - 1; i++) {
		const bigram = first.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram) + 1
			: 1;

		firstBigrams.set(bigram, count);
	};

	let intersectionSize = 0;
	for (let i = 0; i < second.length - 1; i++) {
		const bigram = second.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram)
			: 0;

		if (count > 0) {
			firstBigrams.set(bigram, count - 1);
			intersectionSize++;
		}
	}

	return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

export const items = Object.freeze(itemRegistry)

export async function awaitLoad() {
    if (!loaded) {
        await loadItems()
        loaded = true
    }
}