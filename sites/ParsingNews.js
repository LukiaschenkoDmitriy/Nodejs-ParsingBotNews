const axios = require("axios");

const { tsnParse } = require("./tsn");
const { ukrinformParse } = require("./ukrinform")
const { censorParse } = require("./censor");

let urlSites = {'https://tsn.ua/': tsnParse,
				'https://www.ukrinform.ua/block-publications' : ukrinformParse,
				'https://censor.net/ua/news/all': censorParse};

let allNewsBlock = [];

exports.GetNews = async function() {
	if (allNewsBlock.length < 2) {
		for (var key in urlSites) {
		await axios.get(key)
			.then(response => urlSites[key](response, allNewsBlock, getCode))
			.catch((e) => catchError(e));
		}
	}
	console.log(`All news: ${allNewsBlock.length}`)
};

exports.getNotPublishNews = function() {
	let publishNews;

	allNewsBlock.forEach(news => {
		if (!news.published) {
			publishNews = news;
		}
	})

	return publishNews;
}

exports.clearPublishedNews = function() {
	let currentLenghArray = allNewsBlock.length;
	allNewsBlock =  allNewsBlock.filter(news => (news.published == false))
	console.log(`All news cleaned: ${currentLenghArray - allNewsBlock.length}`);
}

exports.allNewsBlock = allNewsBlock;

function catchError(error) {
	if (error.name == "AxiosError") {
		console.log("Status 403! Can't get data content");
		return;
	}
	console.log(error);
}

function getCode(text) {
	return text.length * text.split(' ').length * text.split('а').length;
}