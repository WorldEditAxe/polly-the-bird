import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import pkg from 'fasttext'
const { Classifier } = pkg;
(await import("dotenv")).config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const modelDir = resolve(__dirname, "model.bin")

const model = new Classifier(modelDir)

export enum TextType {
    SELLING_AD = "sellingAds",
    BUYING_AD = "buyingAds",
    DUELING_AD = "duelingAds",
    OTHER = "undef lol"
}

export function cleanString(text: string): string {
    return text
        // strip msg of mentions
        .replace(/<#([0-9]*)>/gmi, '')
        .replace(/<@[^&]([0-9]*)>/gmi, '')
        .replace(/<@&([0-9]*)>/gmi, '')
        .replace(/<a:[a-zA-Z]*:\d*>|<:[a-zA-Z]*:\d*>/gmi, '')
        // remove whitespace & remove dup whitespace
        .replace(/\n/gmi, ' ')
        .replace(/\s\s+/gmi, ' ')
        // remove any non alphanumeric characters
        .replace(/[^a-zA-Z0-9\s]/gmi, '')
}

export async function classify(text: string): Promise<TextType> {
    const cs = cleanString(text)
    if (cs.length <= 0) return TextType.OTHER

    const res = await model.predict(cs, 3)
    if (res.length > 0) {
        switch(res[0].label.replace(/__label__/, '')) {
            default:
                return TextType.OTHER
            case 'buyingAds':
                return TextType.BUYING_AD
                break
            case 'sellingAds':
                return TextType.SELLING_AD
                break
            case 'duelingAds':
                return TextType.DUELING_AD
        }
    } else {
        return TextType.OTHER
    }
}