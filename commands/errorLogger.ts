import { MessageEmbed, WebhookClient } from "discord.js";
import { Logger } from "../lib/logger.js";

const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/954904210107932683/yZLDc3Suqu0ReaEwusjagBjBMofk2FL6i-VNltAw6Z2B_Wfj44kKT5Ux400ZR1Xdt1qP" })

export async function staticBlock() {
    if (process.env.OVERRIDE_ANTI_CRASH == 'true') return
    process.on('unhandledRejection', async (reason, promise) => {
        await webhook.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Error - Unhandled Rejection`)
                    .setColor('#fb9937')
                    .setDescription(`\`\`\`js\n${(reason as any).stack}\n\`\`\``)
                    .setTimestamp()
            ]
        })
    })
    
    process.on('uncaughtException', async e => {
        await webhook.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Error - Uncaught Exception`)
                    .setColor('#ff5959')
                    .setDescription(`\`\`\`js\n${e.stack}\n\`\`\``)
                    .setTimestamp()
            ]
        })
    })
}

export async function handleError(e, customTitle?: string) {
    try {
        await webhook.send({      
            embeds: [
                new MessageEmbed()
                    .setTitle(customTitle || `Command Error`)
                    .setColor('#ff5959')
                    .setDescription(`\`\`\`js\n${e.stack}\n\`\`\``)
                    .setTimestamp()
            ]
        })
    } catch {}
}