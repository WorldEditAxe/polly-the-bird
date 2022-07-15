import { request } from "https";
export var CommentAttributes;
(function (CommentAttributes) {
    CommentAttributes["TOXICITY"] = "TOXICITY";
    CommentAttributes["SEVERE_TOXICITY"] = "SEVERE_TOXICITY";
    CommentAttributes["IDENTITY_ATTACK"] = "IDENTITY_ATTACK";
    CommentAttributes["INSULT"] = "INSULT";
    CommentAttributes["PROFANITY"] = "PROFANITY";
    CommentAttributes["THREAT"] = "THREAT";
    CommentAttributes["SEXUAL"] = "SEXUALLY_EXPLICIT";
})(CommentAttributes || (CommentAttributes = {}));
const MAX_LENGTH = 20480;
function post(hostname, path, body, headers) {
    return new Promise((resolve, rej) => {
        const options = {
            hostname: hostname,
            path: path,
            port: 443,
            method: 'POST',
            headers: headers
        };
        const req = request(options, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('error', rej);
            res.on('end', () => resolve(data));
        });
        req.on('error', rej);
        req.write(body);
        req.end();
    });
}
export async function analyzeComment(text, key, options) {
    if (text.length > MAX_LENGTH)
        throw new Error("Text too long!");
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
    });
    const p = JSON.parse(req);
    console.log(JSON.stringify(p))
    if (p.error)
        throw new Error(p.error);
    else
        return p;
}
//# sourceMappingURL=api-wrapper.js.map
