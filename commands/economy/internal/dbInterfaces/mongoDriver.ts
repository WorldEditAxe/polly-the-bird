import { Db, MongoClient } from "mongodb"
import { Logger } from "../../../../lib/logger.js"

export const saveVersion = 1
const logger = new Logger("Economy")

export const invSchema = {
    user_id: "",
    wallet_balance: 0,
    bank_balance: 0,
    save_version: saveVersion,
    inventory: {},
    attributes: {}
}

export const settingsSchema = {
    user_id: "",
    save_version: saveVersion
}

let mongoClient: MongoClient
let economy: Db
let settings: Db

export async function connectMongo(uri?: string) {
    const conString = uri ? uri : process.env.MONGO_URI

    logger.debug(`Connecting to MongoDB database at address ${conString}...`)

    mongoClient = new MongoClient(conString)
    await mongoClient.connect()

    economy = mongoClient.db("economy")
    settings = mongoClient.db("economy_settings")

    logger.debug(`Connected to MongoDB database and instantiated connections to the user data and setting databases.`)
}

// TODO: optimize db calls
export async function userExists(user: string): Promise<boolean> {
    const res = (await economy.collection("inventories").findOne({ user_id: user })) != undefined

    return res
}

export async function initUser(user: string) {
    let insert_inv = { ...invSchema }
    let insert_settings = { ...settingsSchema }

    insert_inv.user_id = user
    insert_settings.user_id = user

    await economy.collection("inventories").insertOne(insert_inv)
    await settings.collection("settings").insertOne(insert_settings)
}

export async function retrieveInventory(user: string): Promise<typeof invSchema> {
    if (!await userExists(user)) await initUser(user)
    return (await economy.collection("inventories").findOne({ user_id: user })) as any
}

export async function retrieveSettings(user: string): Promise<typeof settingsSchema> {
    if (!await userExists(user)) await initUser(user)
    return (await settings.collection("settings").findOne({ user_id: user })) as any
}

export async function saveInventory(user: string, inv: typeof invSchema) {
    delete (inv as any)._id

    await economy.collection("inventories").updateOne({ user_id: user }, { $set: inv })
}

export async function saveSettings(user: string, inv: typeof invSchema) {
    delete (inv as any)._id

    await settings.collection("settings").updateOne({ user_id: user }, { $set: inv })
}

export async function execArbitraryCode(code: (client: MongoClient) => any): Promise<any> { return code(mongoClient) }

export async function staticBlock() {
    await connectMongo()
    logger.debug("Loaded MongoDB database driver.")
}