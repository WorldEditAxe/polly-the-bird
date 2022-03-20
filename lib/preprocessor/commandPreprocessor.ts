import { CooldownDate } from "./cooldownDate.js"

export class CommandPreprocessor {
    cooldown: number
    saveCooldownInDb: boolean
    requiredPermissions: ReadonlyArray<BigInt>
    botPermissions: ReadonlyArray<BigInt>
    serverOnly: boolean

    constructor(options: { cooldown?: CooldownDate, requiredPermissions?: BigInt[], serverOnly?: boolean, saveCooldownInDb?: boolean, botPermissions?: BigInt[] }) {
        this.cooldown = options.cooldown ? options.cooldown.getTotalSeconds() : 0
        this.requiredPermissions = options.requiredPermissions || undefined
        this.serverOnly = options.serverOnly || false
        this.saveCooldownInDb = options.saveCooldownInDb || false
    }
}