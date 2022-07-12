import { Permissions } from "discord.js";
import { saveUserEntry } from "./db_wrapper.js";
const GUILD_ID = '784491141022220309';
export const ALLOWED_ROLES = [
    '784527745539375164',
    '789642191583838208',
    '789642191521316884',
    '784492058756251669',
    '788738305365114880',
    '784528018939969577', // owner
];
export var GrantType;
(function (GrantType) {
    GrantType["ROLE_GRANT"] = "role_grant";
    GrantType["EMOJI_AR"] = "emoji_ar";
    GrantType["TEXT_AR"] = "text_ar";
    GrantType["PRIVATE_CHANNEL"] = "private_channel";
})(GrantType || (GrantType = {}));
export class UserEntry {
    constructor(user, grantList) {
        this.user = user;
        this.grants = [];
        grantList.forEach(grant => {
            this.grants.push(dbUtils.parseGrant(grant));
        });
    }
    getGrants() {
        return Object.freeze([...this.grants]);
    }
    async addGrant(grant) {
        this.grants.push(grant);
        await saveUserEntry(this);
    }
    async removeGrant(grant) {
        grant = typeof grant == 'number' ? grant : this.grants.indexOf(grant);
        if (!(grant >= 0))
            throw new Error("Cannot find grant in array!");
        this.grants.splice(grant, 1);
        await saveUserEntry(this);
    }
    async updateGrant(grant, changes) {
        grant = typeof grant == 'number' ? this.grants[grant] : grant;
        if (!(grant >= 0))
            throw new Error("The passed grant is either null or points to a null index!");
        changes(grant);
        await saveUserEntry(this);
    }
    toObject() {
        const p = [];
        this.grants.forEach(grant => p.push(grant.toObject()));
        return {
            user_id: this.user,
            grant_list: p
        };
    }
}
export class RoleGrant {
    constructor(dbGrant) {
        this.grantUser = dbGrant.owner;
        this.type = dbGrant.grant_type;
        this.expiryDate = dbGrant.expiry_time != null ? new Date(dbGrant.expiry_time * 1000) : null;
        this.message = dbGrant.message || null;
    }
    async onGrant() {
        const client = global.bot.djsClient;
        const member = await client.guilds.cache.get(this.guild_id).members.fetch(this.grantUser);
        if (member.moderatable)
            await member.roles.add(this.role_id);
    }
    async onRemove() {
        const client = global.bot.djsClient;
        const member = await client.guilds.cache.get(this.guild_id).members.fetch(this.grantUser);
        if (member.moderatable)
            await member.roles.remove(this.role_id);
    }
    toObject() {
        return {
            owner: this.grantUser,
            grant_type: GrantType.ROLE_GRANT,
            expiry_time: this.expiryDate ? Math.floor(this.expiryDate.getTime() / 1000) : null,
            message: this.message || null,
            role_id: this.role_id,
            guild_id: this.guild_id
        };
    }
}
export class EmojiARGrant {
    constructor(dbObj) {
        this.grantUser = dbObj.owner;
        this.type = dbObj.grant_type;
        this.expiryDate = dbObj.expiry_time != null ? new Date(dbObj.expiry_time * 1000) : null;
        this.message = dbObj.message || null;
        this.emoji_id = dbObj.emoji_id;
    }
    onGrant() {
        // do nothing
    }
    onRemove() {
        // do nothing
    }
    toObject() {
        return {
            owner: this.grantUser,
            grant_type: GrantType.EMOJI_AR,
            expiry_time: this.expiryDate ? Math.floor(this.expiryDate.getTime() / 1000) : null,
            message: this.message,
            emoji_id: this.emoji_id,
        };
    }
}
export class TextARGrant {
    constructor(obj) {
        this.grantUser = obj.owner;
        this.type = obj.grant_type;
        this.expiryDate = obj.expiry_time != null ? new Date(obj.expiry_time * 1000) : null;
    }
    onGrant() {
        // do nothing
    }
    onRemove() {
        // do nothing
    }
    toObject() {
        return {
            owner: this.grantUser,
            grant_type: GrantType.TEXT_AR,
            expiry_time: this.expiryDate ? Math.floor(this.expiryDate.getTime() / 1000) : null,
            message: this.message || null,
            response_message: this.response_message
        };
    }
}
export class PrivateChannelGrant {
    constructor(obj) {
        this.grantUser = obj.owner;
        this.type = obj.grant_type;
        this.expiryDate = obj.expiry_time != null ? new Date(obj.expiry_time * 1000) : null;
        this.message = obj.message;
        this.channelName = obj.channel_name;
        this.channelId = obj.channel_id;
        this.allowedUsers = obj.allowed_users || [];
    }
    async onGrant() {
        const client = global.bot.djsClient;
        await client.guilds.fetch(GUILD_ID)
            .then(async (c) => {
            const overrideList = [];
            overrideList.push({
                id: this.grantUser,
                allow: [Permissions.FLAGS.VIEW_CHANNEL]
            });
            if (this.allowedUsers) {
                for (const allowedUser of this.allowedUsers) {
                    overrideList.push({
                        id: allowedUser,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL]
                    });
                }
            }
            const channel = await c.channels.create(`🐸┃${this.channelName}`, {
                type: 'GUILD_TEXT',
                permissionOverwrites: overrideList
            });
            this.channelId = channel.id;
        });
    }
    async onRemove() {
        const client = global.bot.djsClient;
        await client.guilds.fetch(GUILD_ID)
            .then(async (g) => {
            await g.channels.delete(this.channelId);
            this.channelId = null;
        });
    }
    toObject() {
        return {
            owner: this.grantUser,
            grant_type: GrantType.PRIVATE_CHANNEL,
            expiry_time: this.expiryDate ? Math.floor(this.expiryDate.getTime() / 1000) : null,
            message: this.message,
            channel_name: this.channelName,
            channel_id: this.channelId || null,
            allowed_users: this.allowedUsers || []
        };
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
    parseGrant(dbGrant) {
        switch (dbGrant.grant_type) {
            default:
                return null;
            case GrantType.EMOJI_AR:
                return new EmojiARGrant(dbGrant);
            case GrantType.PRIVATE_CHANNEL:
                return new PrivateChannelGrant(dbGrant);
            case GrantType.ROLE_GRANT:
                return new RoleGrant(dbGrant);
            case GrantType.TEXT_AR:
                return new TextARGrant(dbGrant);
        }
    }
};
//# sourceMappingURL=classes.js.map