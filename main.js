const { Client, Collection , GatewayIntentBits , Partials , ActivityType, EmbedBuilder} = require('discord.js');
// getting normal data from config.json
const data = require("./config.json")
const fs = require('fs');
const mongoose = require('mongoose');

// secure environment for sensitive data such as token
const dotenv = require('dotenv')
dotenv.config()
// the client
const mongo = process.env.mongo

const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
    ],
    partials:[
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.ThreadMember
    ]
});
module.exports = client;


// when the bot is ready and on :
client.on('ready' , async () => {
    // setupTwitter(client)
    console.log("ready to work")
    client.user.setPresence({activities: [{name: `${data.Activity}` , type: ActivityType.Playing}] , status: "online"})
      
})



// Commands && SlashCommands && Events Handling and Initializing The Whole Project..
client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
client.queue = new Map();
client.token= process.env.token;
require(`./source/handlers/cmdHandler/command.js`)(client);
require(`./source/handlers/slashHandler/slash.js`)(client);
require(`./source/handlers/eventHandler/events.js`)(client);


// handling errors 
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});
process.on('typeError', error => {
	console.error('Unhandled type rejection:', error);
});
process.on('uncaughtException' , error => {
    console.error(`Uncaught Exception: ` , error)
})
const mongoEventFiles = fs.readdirSync("./source/mongoEvents").filter(file => file.endsWith(".js"))
client.dblogin = async () => {
	for (file of mongoEventFiles) {
		const event = require(`./source/mongoEvents/${file}`);
		if(event.once) {
			mongoose.connection.once(event.name, (...args) => event.execute(...args));
		} else {
						mongoose.connection.on(event.name, (...args) => event.execute(...args));

		}
	}
	mongoose.Promise = global.Promise
	await mongoose.connect(mongo, {

		useUnifiedTopology: false,
		useNewUrlParser: true,
	})
};
// logging in
client.dblogin(process.env.mongo)
client.login(process.env.token)
