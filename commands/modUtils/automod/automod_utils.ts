import * as decancer from 'decancer'
import { compareTwoStrings } from 'string-similarity'
import { analyzeComment, CommentAttributes } from './perspective-api-wrapper.js'
// Some utilities to help with moderation.

export const DISALLOWED_PHRASES = [
    'nigga',
    'nigger',
    'niger',
]

const dc = decancer as any

const LOGGING_CHANNEL_ID = '992988890510135306'
const perspectiveToken = process.env.PERSPECTIVE_TOKEN
const SEND_DC_STRING_TOL = 0.5
const OFFENSIVE_TOL = 0.75

export function decancerString(dirty: string): string {
    return dc.default(dirty)
}

export function getCleanForm(str: string): string {
    return str.replace(/[[:punct:]]|[^a-zA-Z0-9\ ]/gmi, "")
}

export function unleetspeak(str: string): string {
    return str
        .replace(/@|4/gmi, 'a')
        .replace(/¢|\xA9/gmi, 'c')
        .replace(/3/gmi, 'e')
        .replace(/6|8/gmi, 'g')
        .replace(/1|!/gmi, 'i')
        .replace(/\|_|\|/gmi, 'l')
        .replace(/Ⓡ|®/gmi, 'r')
        .replace(/5|$/gmi, 's')
        .replace(/7/gmi, 't')
        .replace(/vv/gmi, 'w')
        .replace(/¥|￥/gmi, 'y')
        .replace(/2/gmi, 'z')
        .toLowerCase()
}

export function cleanString(dirty: string): string {
    const clean = getCleanForm(decancerString(dirty)), percentSimilar = compareTwoStrings(clean, dirty)
    if (percentSimilar < SEND_DC_STRING_TOL) return clean
    else return dirty
}

export async function isStringOffensive(text: string): Promise<boolean> {
    const cleanState = getCleanForm(decancerString(text))
    if (cleanState.length <= 0) return false
    
    const req = await analyzeComment(cleanState, perspectiveToken, {
        requested_attributes: {
            SEVERE_TOXICITY: {
                score_type: 'PROBABILITY',
                score_threshold: 0
            },
            SEXUALLY_EXPLICIT: {
                score_type: 'PROBABILITY',
                score_threshold: 0
            }
        },
        languages: ['en']
    })

    return req.attributeScores.SEVERE_TOXICITY.summaryScore.value > OFFENSIVE_TOL || req.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value > OFFENSIVE_TOL
}

// this is simple and may be inaccurate but works 99% of the time
export function isStringDirty(text: string, customFilter?: string[]): boolean {
    const clean = unleetspeak(cleanString(text))
    return DISALLOWED_PHRASES.some(phrase => clean.includes(phrase)) || DISALLOWED_PHRASES.some(phrase => clean.includes(phrase))
}
