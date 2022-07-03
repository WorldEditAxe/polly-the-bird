import { Client, GuildMember, Permissions, TextChannel } from "discord.js"

const GUILD_ID = '784491141022220309'

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

export class Member {
    user_id: string
    grant_list: Readonly<BaseGrant[]>

    constructor(dbEntry: schema$userEntry) {
        this.user_id = dbEntry.user_id
        this.grant_list = []

        dbEntry.grant_list.forEach(grant => {
            // TODO: work on    
        })
    }
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
        this.expiryDate = dbGrant.expiry_time ? new Date(dbGrant.expiry_time * 1000) : null
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
        this.expiryDate = dbObj.expiry_time ? new Date(dbObj.expiry_time * 1000) : null
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
        this.expiryDate = obj.expiry_time ? new Date(obj.expiry_time * 1000) : null
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
        this.expiryDate = obj.expiry_time ? new Date(obj.expiry_time * 1000) : null
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