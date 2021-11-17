# Discord.js Bot Framework
A discord.js bot skeleton/framework, made with slash commands in mind. Pulled from Bruni's Utilites' node.js port source code.  
Have fun making your own Discord bot!  
*Note: Only the base framework used to make the bot is included. If you'd like to add your own commands, refer to [this guide](https://discordjs.guide/interactions/registering-slash-commands.html).*
## Installation/Deployment
### Prerequisites
#### Required
`@discordjs/builders` >= 0.6.0  
`@discordjs/rest` >= 0.1.0-canary.0  
`@types/node` >= 16.10.3  
`discord-api-types` >= 0.23.1  
`discord.js` >= 13.2.0  
`dotenv` >= 10.0.0  
`typescript` >= 4.4.3    
#### Optional
*These dependencies are not required but are here for the sole purpose of speeding up the bot.*  
`bufferutil` >= 4.0.4  
`utf-8-validate` >= 5.0.6  
`zlib-sync` >= 0.1.7  
*These dependencies can be installed by running `npm install` with the exception of typescript. Install TS by running `npm install typescript --save-dev`.*  
### Installation/How to run
1. Run `npm install` and `npm install typescript --save-dev` to install required dependencies.  
2. Create an environment file (.env) with the following content:  
```
TOKEN="" // Insert token here.
CLIENT_ID= // Client ID of bot.
DEV_GUILD_ID= // The development guild's ID. This is where commands are deployed to when bot is not in production mode.
IS_PRODUCTION= // Whether the bot is running in production mode. Bots running in non-production mode will have all their commands updated to the development guild.
```  
3. Transpile the TypeScript code by running `tsc`. This will take some time depending on how beefy your computer is, be patient!  
4. Run `cd dist`, and then run `node index.js`.  

## How to run TypeScript code
1. Install TypeScript by running `npm install typescript --save-dev`.
2. Run `tsc`. This will transpile the TypeScript code to JavaScript since node.js cannot directly execute TypeScript code.
3. Go to the directory `dist` (`cd dist`) and then start the code (`node <fileName>.js` or in our case `node index.js`).