const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");

const { token } = require("./config.json");
const { Channels, cleardatabase } = require("./DB/channels");
const { InitCommandsBot } = require("./src/slashCommands");
const { ControlFunctionBot } = require("./src/controlFunctionBot");
const { GetNews, clearPublishedNews } = require("./sites/ParsingNews");

GetNews();

Channels.sync().then(() => {
	Channels.findAll({raw: true}).then(data => console.log(data));
})

global.bot = new TelegramBot(token, {polling: true});
global.ControlFunctionBotInstance = new ControlFunctionBot();
InitCommandsBot(bot);

global.bot.on('new_chat_members', msg =>{ global.ControlFunctionBotInstance.joinBot(msg); console.log(msg)})
global.bot.on('left_chat_member', msg => global.ControlFunctionBotInstance.leaveBot(msg))
global.bot.on("message", msg => {
	if (msg.chat.type == "private") {
		global.bot.deleteMessage(msg.chat.id, msg.message_id)
	}
});

//Spawn message interval
setInterval(global.ControlFunctionBotInstance.sendNews, 0.5*60*60*1000);
//Clear published news in array
setInterval(clearPublishedNews, 12*60*60*1000);
