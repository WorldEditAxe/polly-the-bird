import { MessageEmbed, WebhookClient } from "discord.js";
const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/954904210107932683/yZLDc3Suqu0ReaEwusjagBjBMofk2FL6i-VNltAw6Z2B_Wfj44kKT5Ux400ZR1Xdt1qP" });
export async function staticBlock() {
    if (process.env.OVERRIDE_ANTI_CRASH == 'true')
        return;
    process.on('unhandledRejection', async (reason, promise) => {
        await webhook.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Error - Unhandled Rejection`)
                    .setColor('#fb9937')
                    .setDescription(`\`\`\`js\n${reason.stack}\n\`\`\``)
                    .setTimestamp()
            ]
        });
    });
    process.on('uncaughtException', async (e) => {
        await webhook.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Error - Uncaught Exception`)
                    .setColor('#ff5959')
                    .setDescription(`\`\`\`js\n${e.stack}\n\`\`\``)
                    .setTimestamp()
            ]
        });
    });
}
export async function handleError(e, customTitle) {
    try {
        await webhook.send({
            embeds: [
                new MessageEmbed()
                    .setTitle(customTitle || `Command Error`)
                    .setColor('#ff5959')
                    .setDescription(`\`\`\`js\n${e.stack}\n\`\`\``)
                    .setTimestamp()
            ]
        });
    }
    catch (_a) { }
}
export async function post(content) {
    if (typeof content == 'string') {
        await webhook.send(content).catch(() => { });
    }
    else {
        await webhook.send({ embeds: content }).catch(() => { });
    }
}
//# sourceMappingURL=errorLogger.js.map