export enum GrantType {
    ROLE_GRANT = "role_grant",
    EMOJI_AR = "emoji_ar",
    TEXT_AR = "text_ar",
    PRIVATE_CHANNEL = "private_channel",
    EMOJI = "custom_emoji"
}

export enum TitleType {
    THREE_INVITES = "three_invites",
    FIFTEEN_INVITES = "fifteen_invites",
    THIRTY_INVITES = "thirty_invites",
    FIFTY_INVITES = "fifty_invites",
    TOP_WEEKLY = "top_weekly",
    SERVER_SUPPORTER = "server_supporter",
    BOT_MASTER = "bot_master",
    BOT_DEV = "bot_dev",
    BUMP_GOD = "bump_god",
    TRUSTED_TRADER = "trusted_trader",
    TOP_RATED_TRADER = "top_trader",
    HARBOR_VETERAN = "harbor_veteran",
    SERVER_BOT_DEV = "server_bot_dev",
    SERVER_BANNER_ARTIST = "server_banner_artist",
    ONEK_WINNER = "1k_winner",
    CHRISTMAS_2022 = "christmas_2022",
    HIGHEST_DONOR = "highest_donor",
    HIGHEST_ROB_PAYOUT_DONOR = "highest_rob_payout_donor",
    SIXK_SPECIAL_TOP_THREE_DONORS = "6k_special_top_three_donors",
    FIVE_DOLLAR_INVESTOR = "five_dollar_investor",
    TWENTY_FIVE_DOLLAR_INVESTOR = "twenty_five_dollar_investor",
    FIFTY_DOLLAR_INVESTOR = "fifty_collar_investor",
    ONE_HUNDRED_DOLLAR_INVESTOR = "one_hundred_dollar_investor",
    SINGLE_BOOSTER = "single_booster",
    DOUBLE_BOOSTER = "double_booster",
    MULTI_BOOSTER = "multi_booster"
}

// expiry dates are stored as UNIX seconds
export type grantExpiry = number | 'PERMANENT'

export type schema$userEntryGrants = {
    user_id: string,
    grant_list: schema$baseGrant[]
    title_list: schema$baseTitle[]
}

export type schema$baseGrant = {
    owner: string
    grant_type: GrantType,
    expiry_time?: number,
    message: string
}

export type schema$baseTitle = {
    owner: string
    title_type: TitleType,
    expiry_time?: number,
    granted_grants: schema$baseGrant[]
}

export class Member {
    user_id: string
    grant_list: Readonly<BaseGrant[]>
    title_list: Readonly<BaseTitle[]>

    constructor(dbEntry: schema$userEntryGrants) {
        this.user_id = dbEntry.user_id
        this.grant_list = []
        this.title_list = []

        dbEntry.grant_list.forEach(grant => {
            // TODO: work on    
        })
    }
}

export interface BaseTitle {
    titleHolderUser: string
    titleType: TitleType
    grantedGrants: BaseGrant[]
    expiryTime?: number
    message?: string

    onGrant(): void
    onRemove(): void
    toObject(): object
}

export interface BaseGrant {
    grantUser: string
    type: GrantType
    expiryDate?: number
    message?: string

    onGrant(): void
    onRemove(): void
    toObject(): object
}

// TODO: work on
export const dbUtils = {
    dbObjectMappings: [

    ],
    parseGrant(dbGrant: schema$baseGrant): BaseGrant {

    },
    parseTitle(dbTitle: schema$baseTitle): BaseTitle {

    },
    titleToJson(title: BaseTitle): schema$baseTitle {

    },
    grantToJson(grant: BaseGrant): schema$baseGrant {

    }
}