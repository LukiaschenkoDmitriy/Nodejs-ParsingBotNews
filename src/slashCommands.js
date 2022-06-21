const { Channels } = require("../DB/channels");
const { language } = require("../locales/locale.json");

Channels.sync();

exports.InitCommandsBot = function() {
	global.bot.onText(/\/start/, msg => {
		if (msg.chat.type == "private") {
			Channels.findAll({where: {chatID: msg.chat.id}}).then(data => {
				if (data.length == 0) {
					global.ControlFunctionBotInstance.addChatInDatabase(msg);
					global.ControlFunctionBotInstance.helpBot(msg);
					global.ControlFunctionBotInstance.getAllBots(msg);
				} else {
					global.bot.sendMessage(msg.chat.id, language.title, {parse_mode:"HTML"})
					global.ControlFunctionBotInstance.getStatus(msg);
				}
			})
		}
	})

	global.bot.onText(/\/gethelp/, msg=> {
		global.ControlFunctionBotInstance.helpBot(msg);
	})

	global.bot.onText(/\/allbots/, msg => {
		global.ControlFunctionBotInstance.getAllBots(msg);
	})

	global.bot.onText(/\/getstatus/, msg => {
		global.ControlFunctionBotInstance.getStatus(msg);
	})

	global.bot.onText(/\/publish_off/, msg => {
		if (msg.chat.type == "private") {
			global.ControlFunctionBotInstance.stopBot(msg);
		} else {
			global.ControlFunctionBotInstance.thisUserCreator(msg).then(userCretor => {
				if (userCretor) {global.ControlFunctionBotInstance.stopBot(msg)} 
				else {global.ControlFunctionBotInstance.notPermissionsMessage(msg)}
			})
		}
	})

	global.bot.onText(/\/publish_on/, msg => {
		if (msg.chat.type == "private") {
			global.ControlFunctionBotInstance.startBot(msg);
		} else {
			global.ControlFunctionBotInstance.thisUserCreator(msg).then(userCretor => {
				if (userCretor) {global.ControlFunctionBotInstance.startBot(msg)}
				else {global.ControlFunctionBotInstance.notPermissionsMessage(msg)}
			})
		}
	})
} 