import { MessageEmbed, WebhookClient } from "discord.js";

const  webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/936464227244318811/cUDTQI8ceQhOHK_LNgE9x7n1Xlj8uukkD3-Jfqvd0hPUtMp0EfOf9HRArdUcg9Y4MotF" })

process.on('unhandledRejection', async e => {
    await webhook.send({
        embeds: [
            new MessageEmbed()
                .setTitle(`Error - Unhandled Rejection`)
                .setColor('#fb9937')
                .setDescription(`\`\`\`js\n${e}\n\`\`\``)
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