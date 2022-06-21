const { language } = require("../locales/locale.json");
const { GetNews, getNotPublishNews, clearPublishedNews, allNewsBlock } = require("../sites/ParsingNews");
const { Channels } = require("../DB/channels");

exports.ControlFunctionBot = class {
	constructor() {
		global.bot.setMyCommands([{command: "/publish_on", description: language.botOnDesc},
					   {command: "/publish_off", description: language.botOffDesc},
					   {command: "/getstatus", description: language.botStatusDesc},
					   {command : "/allbots", description: language.botsInfoDesc},
					   {command: "/gethelp", description: language.botHelpDesc}])
	}

	async thisUserCreator(msg) {
		let userCreator = false;
		await global.bot.getChatAdministrators(msg.chat.id).then(admns => {
			admns.forEach(adm => {
				if (adm.user.id == msg.from.id && adm.status == "creator") {
					userCreator = true;
				}
			})
		});
		return userCreator
	}

	addChatInDatabase(msg) {
		Channels.create({
			chatID : msg.chat.id,
			title: msg.chat.title,
			type: msg.chat.type,
			status: "publish",
		});
		Channels.sync();
	}

	getAllBots(msg) {
		global.bot.sendMessage(msg.from.id, `${language.allBotsInfo}`, {parse_mode:"HTML"});
	}

	notPermissionsMessage(msg) {
		global.bot.sendMessage(msg.from.id, `(${msg.chat.title}) ${language.notPermissions}`, {parse_mode: "HTML"})
	}

	leaveBot(msg) {
		if (msg.left_chat_member.is_bot && msg.left_chat_member.username == language.botUsername) {
			Channels.destroy({where: {chatID: msg.chat.id}});
		}
	}

	joinBot(msg) {
		if (msg.new_chat_member.is_bot && msg.new_chat_member.username == language.botUsername) {
			Channels.create({
				chatID : msg.chat.id,
				title: msg.chat.title,
				type: msg.chat.type,
				status: "publish",
			});
			Channels.sync();
		}
	}

	getStatus(msg) {
		Channels.findOne({where: {chatID: msg.chat.id}}).then(data => {
			if (data != null) {
				let message;
				if (msg.chat.type == "private") {
					message = data.status == "publish" ? language.publishStatusPrivate : language.notPublishStatusPrivate;
					global.bot.sendMessage(msg.from.id, message, {parse_mode: 'HTMl'})
				} else {
					global.ControlFunctionBotInstance.thisUserCreator(msg).then(userCretor => {
						if (userCretor) {
							message = data.status == "publish" ? `(${msg.chat.title}) `+language.publishStatusOther : `(${msg.chat.title}) `+language.notPublishStatusOther;
							global.bot.sendMessage(msg.from.id, message, {parse_mode: 'HTMl'})
						} 
						else {global.ControlFunctionBotInstance.notPermissionsMessage(msg)}
					})
				}
			} else {
				global.bot.sendMessage(msg.chat.id, language.notInDatabase ,{parse_mode : "HTML"})
			}
		})
	}

	startBot(msg) {
		Channels.findOne({where: {chatID:msg.chat.id}}).then(data => {
			if (data != null) {
				if (data.status != "publish") {
					Channels.update({status: "publish"}, {where: {chatID:msg.chat.id}}).then(() => {
						Channels.sync();

						if (msg.chat.type == "private") {
							global.bot.sendMessage(msg.chat.id, language.botOnPrivate)
						} else {
							global.bot.sendMessage(msg.from.id, `(${msg.chat.title}) ` + language.botOnOther)
						}
					});
				}
			} else {
				if (msg.chat.type == "private") {
					global.bot.sendMessage(msg.chat.id, language.notInDatabasePrivate ,{parse_mode : "HTML"})
				} else {
					global.bot.sendMessage(msg.chat.id, language.notInDatabaseOther ,{parse_mode : "HTML"})
				}
			}
		})
	}

	stopBot(msg) {
		Channels.findOne({where: {chatID: msg.chat.id}}).then(data => {
			if (data != null) {
				if (data.status == "publish") {
					Channels.update({status: "notpublish"}, {where: {chatID:msg.chat.id}}).then(() => {
						Channels.sync();
						if (msg.chat.type == "private") {
							global.bot.sendMessage(msg.chat.id, language.botOffPrivate)
						} else {
							global.bot.sendMessage(msg.from.id, "("+msg.chat.title+") " + language.botOffOther)
						}
					});
				}
			} else {
				global.bot.sendMessage(msg.chat.id, language.notInDatabase ,{parse_mode : "HTML"})
			}
		})
	}

	sendNews() {
		Channels.findAll({raw:true}).then(data => {
			GetNews().then(() => {
				let publishNews = getNotPublishNews();
				data.forEach(info => {
					if (info.status == "publish") {
						global.bot.sendPhoto(info.chatID, publishNews.photoUrl, {
						caption: "<b>"+publishNews.title+"</b>" +
							"\n\n" + publishNews.text +
							`\n\n <b>${language.title}</b>`,
						parse_mode: "HTML",
						reply_markup: {inline_keyboard : [[{text: language.continueRead, url:publishNews.url}]]}
						});
					}
				});

				publishNews.published = true;
				console.log("All news: " + allNewsBlock.length);
			});
		})
	}

	helpBot(msg) {
		if (msg.chat.type == "private") {
			global.bot.sendMessage(msg.chat.id, language.botHelp, {parse_mode:"HTML"})
		} else {
			global.bot.sendMessage(msg.from.id, "("+ msg.chat.title +")\n\n"+language.botHelp, {parse_mode:"HTML"})
		}
	}
}