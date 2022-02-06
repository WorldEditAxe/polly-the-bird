import { createClient, RedisClient } from "redis"
import { Logger } from "../../../../lib/logger.js"
import { invSchema } from "./mongoDriver.js"

let redisClient: RedisClient
const l = new Logger("RedisCache")
const cacheTTL = 10 * 60

export async function initCon(redisUri?: string) {
    redisClient = createClient({ url: (redisUri ? redisUri : process.env.REDIS_URI) })
    redisClient.on('error', (e) => { l.fatal(`An error has occurred in the Redis cache system: ${e}.`) })
}

export async function isCached(usr: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        redisClient.get(usr, (err, reply) => {
            if (err != null) reject(err)
            resolve(reply == null ? false : true)
        })
    })
}

export async function set(usr: string, data: string) {
    return new Promise<void>((resolve, reject) => {
        redisClient.set(usr, data, (err, reply) => {
            if (err != null) reject(err)
            resolve()
            redisClient.expire(usr, cacheTTL)
        })
    })
}

export async function get(usr: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        redisClient.get(usr, (err, reply) => {
            if (err != null) reject(err)
            resolve(reply)
            redisClient.expire(usr, cacheTTL)
        })
    })
}

export async function deleteEntry(usr: string): Promise<void> {
    return new Promise<void>((res, rej) => {
        redisClient.del(usr, err => {
            if (err) rej()
            else res()
        })
    })
}

export function serialize(data: typeof invSchema): string {
    return JSON.stringify(data)
}

export function decode(data: string): typeof invSchema {
    return JSON.parse(data)
}

export async function staticBlock() {
    await initCon()
}