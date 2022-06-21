const Sequelize = require('sequelize');

const Server = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
})

exports.Channels = Server.define('channels', {
    chatID: {type: Sequelize.BIGINT},
    title: {type: Sequelize.STRING},
    type: {type: Sequelize.STRING},
    status: {type: Sequelize.STRING}},
	{timestamps: false})

exports.cleardatabase = function(accept = "") {
    if (accept == "I really want clear database") {
        exports.Channels.sync({force:true});
        console.log("[Database clear] Database clear!");
    } else {
        console.log("[Database clear] Pass string 'I really want database' in parament 'accept'")
    }
}