import { Client, Permissions, TextChannel } from "discord.js"
import { saveUserEntry } from "./db_wrapper.js"

const GUILD_ID = '784491141022220309'

export const ALLOWED_ROLES = [
    '784527745539375164', // moderator
    '789642191583838208', // smod
    '789642191521316884', // hmod
    '784492058756251669', // admin
    '788738305365114880', // co-owner
    '784528018939969577', // owner
]

export enum GrantType {
    ROLE_GRANT = "role_grant",
    EMOJI_AR = "emoji_ar",
    TEXT_AR = "text_ar",
    PRIVATE_CHANNEL = "private_channel"
}

// expiry dates are stored as UNIX seconds
export type grantExpiry = number | 'PERMANENT'

export type schema$userEntry = {
    user_id: string,
    grant_list: schema$baseGrant[]
}

export type schema$baseGrant = {
    owner: string
    grant_type: GrantType,
    expiry_time?: number,
    message?: string
}

export interface BaseGrant {
    grantUser: string
    type: GrantType
    expiryDate?: Date
    message?: string

    onGrant(): void | Promise<void>
    onRemove(): void | Promise<void>
    toObject(): object
}

export type schema$roleGrant = {
    owner: string
    grant_type: GrantType.ROLE_GRANT,
    expiry_time?: number,
    message?: string
    role_id: string,
    guild_id: string
}

export class UserEntry {
    user: string
    private grants: BaseGrant[]

    constructor(user: string, grantList: schema$baseGrant[]) {
        this.user = user
        this.grants = []

        grantList.forEach(grant => {
            this.grants.push(dbUtils.parseGrant(grant))
        })
    }

    getGrants(): Readonly<BaseGrant[]> {
        return Object.freeze([...this.grants])
    }

    async addGrant(grant: BaseGrant) {
        this.grants.push(grant)
        await saveUserEntry(this)
    }

    async removeGrant(grant: BaseGrant | number) {
        grant = typeof grant == 'number' ? grant : this.grants.indexOf(grant)
        if (!((grant as any) >= 0)) throw new Error("Cannot find grant in array!")
        this.grants.splice(grant, 1)
        await saveUserEntry(this)
    }

    async updateGrant(grant: BaseGrant | number, changes: (grant: BaseGrant) => void | any) {
        grant = typeof grant == 'number' ? this.grants[grant] : grant
        if (!((grant as any) >= 0)) throw new Error("The passed grant is either null or points to a null index!")
        changes(grant)
        await saveUserEntry(this)
    }

    toObject(): schema$userEntry {
        const p: schema$baseGrant[] = []
        this.grants.forEach(grant => p.push(grant.toObject() as any))

        return {
            user_id: this.user,
            grant_list: p
        } as schema$userEntry
    }
}

export class RoleGrant implements BaseGrant {
    grantUser: string
    type: GrantType.ROLE_GRANT
    expiryDate?: Date
    message?: string
    role_id: string
    guild_id: string
    
    constructor(dbGrant: schema$roleGrant) {
        this.grantUser = dbGrant.owner
        this.type = dbGrant.grant_type
        this.expiryDate = dbGrant.expiry_time != null ? new Date(dbGrant.expiry_time * 1000) : null
        this.message = dbGrant.message || null
    }
    async onGrant(): Promise<void> {
        const client: Client = global.bot.djsClient
        const member = await client.guilds.cache.get(this.guild_id).members.fetch(this.grantUser)
        if (member.moderatable) await member.roles.add(this.role_id)
    }
    async onRemove(): Promise<void> {
        const client: Client = global.bot.djsClient
        const member = await client.guilds.cache.get(this.guild_id).members.fetch(this.grantUser)
        if (member.moderatable) await member.roles.remove(this.role_id)
    }
    toObject(): object {
        return {
            owner: this.grantUser,
            grant_type: GrantType.ROLE_GRANT,
            expiry_time: this.expiryDate ? Math.floor(this.expiryDate.getTime() / 1000): null,
            message: this.message || null,
            role_id: this.role_id,
            guild_id: this.guild_id
        } as schema$roleGrant
    }
}

export type schema$emojiARGrant = {
    owner: string
    grant_type: GrantType.EMOJI_AR,
    expiry_time?: number,
    message?: string
    emoji_id: string
    guild_id: string
}

export class EmojiARGrant implements BaseGrant {
    grantUser: string
    type: GrantType.EMOJI_AR
    expiryDate?: Date
    message?: string
    emoji_id: string

    constructor(dbObj: schema$emojiARGrant) {
        this.grantUser = dbObj.owner
        this.type = dbObj.grant_type
        this.expiryDate = dbObj.expiry_time != null ? new Date(dbObj.expiry_time * 1000) : null
        this.message = dbObj.message || null
        this.emoji_id = dbObj.emoji_id
    }
    onGrant(): void | Promise<void> {
        // do nothing
    }
    onRemove(): void | Promise<void> {
        // do nothing
    }
    toObject(): object {
        return {
            owner: this.grantUser,
            grant_type: GrantType.EMOJI_AR,
            expiry_time: this.expiryDate ? Math.floor(this.expiryDate.getTime() / 1000) : null,
            message: this.message,
            emoji_id: this.emoji_id,
        } as schema$emojiARGrant
    }
}

export type schema$textARGrant = {
    owner: string
    grant_type: GrantType.TEXT_AR,
    expiry_time?: number,
    message?: string
    response_message: string
}

export class TextARGrant implements BaseGrant {
    grantUser: string
    type: GrantType.TEXT_AR
    expiryDate?: Date
    message?: string
    response_message: string

    constructor(obj: schema$textARGrant) {
        this.grantUser = obj.owner
        this.type = obj.grant_type
        this.expiryDate = obj.expiry_time != null ? new Date(obj.expiry_time * 1000) : null
    }
    onGrant(): void | Promise<void> {
        // do nothing
    }
    onRemove(): void | Promise<void> {
        // do nothing
    }
    toObject(): object {
        return {
            owner: this.grantUser,
            grant_type: GrantType.TEXT_AR,
            expiry_time: this.expiryDate ? Math.floor(this.expiryDate.getTime() / 1000): null,
            message: this.message || null,
            response_message: this.response_message
        } as schema$textARGrant
    }
}

export type schema$privateChannelGrant = {
    owner: string,
    grant_type: GrantType,
    expiry_time?: number,
    message?: string,
    channel_name: string,
    channel_id: string,
    allowed_users: string[]
}

export class PrivateChannelGrant implements BaseGrant {
    grantUser: string
    type: GrantType
    expiryDate?: Date
    message?: string
    channelName: string
    channelId: string
    allowedUsers: string[]

    constructor(obj: schema$privateChannelGrant) {
        this.grantUser = obj.owner
        this.type = obj.grant_type
        this.expiryDate = obj.expiry_time !=  null ? new Date(obj.expiry_time * 1000) : null
        this.message = obj.message
        this.channelName = obj.channel_name
        this.channelId = obj.channel_id
        this.allowedUsers = obj.allowed_users || []
    }
    async onGrant(): Promise<void> {
        const client: Client = global.bot.djsClient;
        await client.guilds.fetch(GUILD_ID)
            .then(async c => {
                const overrideList: { id: string, allow: bigint[] }[] = []
                overrideList.push({
                    id: this.grantUser,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL]
                })
                if (this.allowedUsers) {
                    for (const allowedUser of this.allowedUsers) {
                        overrideList.push({
                            id: allowedUser,
                            allow: [Permissions.FLAGS.VIEW_CHANNEL]
                        })
                    }
                }

                const channel: TextChannel = await c.channels.create(`🐸┃${this.channelName}`, {
                    type: 'GUILD_TEXT',
                    permissionOverwrites: overrideList
                })
                this.channelId = channel.id
            })
    }
    async onRemove(): Promise<void> {
        const client: Client = global.bot.djsClient;
        await client.guilds.fetch(GUILD_ID)
            .then(async g => {
                await g.channels.delete(this.channelId)
                this.channelId = null
            })
    }
    toObject(): object {
        return {
            owner: this.grantUser,
            grant_type: GrantType.PRIVATE_CHANNEL,
            expiry_time: this.expiryDate ? Math.floor(this.expiryDate.getTime() / 1000) : null,
            message: this.message,
            channel_name: this.channelName,
            channel_id: this.channelId || null,
            allowed_users: this.allowedUsers || []
        } as schema$privateChannelGrant
    }
}

// TODO: work on
export const dbUtils = {
    dbObjectMappings: [
        [GrantType.ROLE_GRANT, RoleGrant],
        [GrantType.EMOJI_AR, EmojiARGrant],
        [GrantType.TEXT_AR, TextARGrant],
        [GrantType.PRIVATE_CHANNEL, PrivateChannelGrant]
    ],
    parseGrant(dbGrant: schema$baseGrant): BaseGrant {
        switch(dbGrant.grant_type) {
            default:
                return null
            case GrantType.EMOJI_AR:
                return new EmojiARGrant(dbGrant as schema$emojiARGrant)
            case GrantType.PRIVATE_CHANNEL:
                return new PrivateChannelGrant(dbGrant as schema$privateChannelGrant)
            case GrantType.ROLE_GRANT:
                return new RoleGrant(dbGrant as schema$roleGrant)
            case GrantType.TEXT_AR:
                return new TextARGrant(dbGrant as schema$textARGrant)
        }
    }
}