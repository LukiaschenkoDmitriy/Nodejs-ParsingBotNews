const axios = require("axios");

const { tsnParse } = require("../sites/tsn");
const { censorParse } = require("../sites/censor");

let urlSites = {'https://tsn.ua/ru': tsnParse,
				'https://censor.net/ru/news/all': censorParse};

let allNewsBlock = [];

exports.GetNews = async function() {
	for (var key in urlSites) {
		await axios.get(key)
			.then(response => urlSites[key](response, allNewsBlock, getCode))
			.catch((e) => console.log(e));
	}
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
	let currentLength = allNewsBlock.length;
	allNewsBlock =  allNewsBlock.filter(news => (news.published == false));
	console.log(`Clear ${currentLength- allNewsBlock.length} articles`);
}

exports.allNewsBlock = allNewsBlock;

function getCode(text) {
	return text.length * text.split(' ').length * text.split('а').length;
}