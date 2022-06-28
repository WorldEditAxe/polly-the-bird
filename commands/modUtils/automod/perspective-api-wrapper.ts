import { OutgoingHttpHeader } from "http";
import { request, RequestOptions } from "https"

export enum CommentAttributes {
    TOXICITY = 'TOXICITY',
    SEVERE_TOXICITY = 'SEVERE_TOXICITY',
    IDENTITY_ATTACK = 'IDENTITY_ATTACK',
    INSULT = 'INSULT',
    PROFANITY = 'PROFANITY',
    THREAT = 'THREAT'
}

export type langCodes = 'ar'
    | 'zh'
    | 'cs'
    | 'nl'
    | 'en'
    | 'fr'
    | 'de'
    | 'hi'
    | 'hi-Latn'
    | 'id'
    | 'it'
    | 'ja'
    | 'ko'
    | 'pl'
    | 'pt'
    | 'ru'
    | 'es'

export type AnalyzeCommentOptions = {
    requested_attributes?: {
        [CommentAttributes.IDENTITY_ATTACK]?: { score_type: "PROBABILITY", score_threashold: number },
        [CommentAttributes.INSULT]?: { score_type: "PROBABILITY", score_threashold: number },
        [CommentAttributes.PROFANITY]?: { score_type: "PROBABILITY", score_threashold: number },
        [CommentAttributes.SEVERE_TOXICITY]?: { score_type: "PROBABILITY", score_threashold: number },
        [CommentAttributes.THREAT]?: { score_type: "PROBABILITY", score_threashold: number },
        [CommentAttributes.TOXICITY]?: { score_type: "PROBABILITY", score_threashold: number }
    },
    span_annotations?: boolean,
    languages?: langCodes[],
    do_not_store?: boolean,
    client_token?: string,
    session_id?: string,
    community_id?: string
}

export type AnalyzeCommentResponse = {
    attribute_scores: {
        [CommentAttributes.IDENTITY_ATTACK]?: {
            summary_score: {
                value: number,
                type: string,
                span_scores?: { begin: number, end: number, score: { value: number, type: string } }[]
            }
        }
    },
    languages: langCodes[],
    client_token?: string
}

const MAX_LENGTH = 20480;

function post(hostname: string, path: string, body: string, headers: NodeJS.Dict<OutgoingHttpHeader>, errorCodes?: number[]): Promise<string> {
    return new Promise<string>((resolve, rej) => {
        const options: RequestOptions = {
            hostname: hostname,
            path: path,
            port: 443,
            method: 'POST',
            headers: headers
        }
        const req = request(options, res => {
            if (errorCodes.some(code => code == res.statusCode)) {
                rej(res.statusCode)
            } else {
                let data = ''
                res.on('data', d => data += d)
                res.on('error', rej)
                res.on('end', () => resolve(data))
            }
        })

        req.on('error', rej)
        req.write(body)
        req.end()
    })
}

export async function analyzeComment(text: string, key: string, options: AnalyzeCommentOptions): Promise<AnalyzeCommentResponse> {
    if (text.length > MAX_LENGTH) throw new Error("Text too long!")
    const req = await post("commentanalyzer.googleapis.com", `/v1alpha1/comments:analyze?key=${key}`, JSON.stringify({
        comment: {
            text: text
        },
        requested_attributes: options.requested_attributes || {},
        span_annotations: options.span_annotations,
        languages: options.languages,
        do_not_store: options.do_not_store,
        client_token: options.client_token,
        session_id: options.session_id,
        community_id: options.community_id
    }), {
        key: key
    }, [403])

    return JSON.parse(req) as any
}