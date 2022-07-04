import { createInterface } from "readline"
import { classify } from "./ai.js"

let inter

function ask(question: string): Promise<string> {
    return new Promise<string>(res => [
        inter.question(`${question}\n> `, ans => {
            res(ans)
        })
    ])
}

if (process.argv.includes("--eval")) {
    inter = createInterface({
        input: process.stdin,
        output: process.stdout
    })
    
    while (true) {
        console.log(`Classified as: ${await classify(await ask("What string do you want me to classify?"))}`)
    }
}